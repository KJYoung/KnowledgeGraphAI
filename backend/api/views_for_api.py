# api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import networkx as nx
import logging
import os
from friendli import Friendli
from dotenv import load_dotenv
from .models import Article, Concept, SuperConcept, UserChattingRoom
from .serializers import ArticleSerializer
from prompts import (
    CHAT_SEP, TABLE_SEP, 
    PROMPT_FOR_URL, PROMPT_FOR_GRAPH,
    GRAPH_EXPLAIN_DB, GRAPH_EMPTY_DB, GRAPH_END_OF_EXPLAIN_DB, CHAT_ROOM, CHAT_MIDDLE, CHAT_END
)
import re, json
from openai import OpenAI

import numpy as np


# OpenAI for Embedding

client_openai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))




# Load environment variables from .env file
load_dotenv()
FRIENDLI_TOKEN = os.getenv('FRIENDLI_TOKEN')
print(FRIENDLI_TOKEN)
client = Friendli(token=FRIENDLI_TOKEN)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

################################################################################################################################
def pairwise(iterable):
    a = iter(iterable)
    return list(zip(a, a))

def get_history(history):
    new_messages = []
    for user, chatbot in history:
        new_messages.append({"role": "user", "content": user})
        new_messages.append({"role": "assistant", "content": chatbot})
    return new_messages
################################################################################################################################

# 처음 URL로부터 정보 얻고, 그에 대한 대화 나누는 View
class ExtractConceptsView(APIView):
    def chat_function(self, message, history):
        new_messages = get_history(history)
        new_messages.append({"role": "user", "content": message})

        stream = client.chat.completions.create(
            model="meta-llama-3-70b-instruct",
            messages=new_messages,
            stream=True,
        )
        res = ""
        for chunk in stream:
            res += chunk.choices[0].delta.content or ""
        return res

    def get(self, request, *args, **kwargs):
        try:
            articles = Article.objects.all()
            # article_names = [{'name': article.name} for article in articles]
            article_names = [article.name for article in articles]
            return Response({ 'chats': article_names}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            return Response({'error': f"An error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, *args, **kwargs):
        url = request.data.get('url')
        message = request.data.get('message')
        if not url:
            return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not message: # Frontend에서 처음으로 URL을 입력하고 Extract Concept를 클릭했을 때.
            try:
                # Check if an Article with the same link already exists
                if Article.objects.filter(link=url).exists():
                    article = Article.objects.get(link=url)
                    serializer = ArticleSerializer(article)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)

                # Initialize history as empty if no previous conversation
                history = []

                # Get the summary from LLM
                url_with_prompt = PROMPT_FOR_URL.format(url=url)
                llm_result = self.chat_function(message=url_with_prompt, history=history)

                # Create and save the Article object
                article = Article(name=url, link=url, summary=llm_result)
                article.save()

                # Return the Article object as JSON
                serializer = ArticleSerializer(article)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except requests.exceptions.RequestException as e:
                logger.error(f"Request failed: {e}")
                return Response({'error': f"Request failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                logger.error(f"An error occurred: {e}")
                return Response({'error': f"An error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        else: # URL을 이미 클릭한 후, Additional Chats - Send를 클릭했을 때.  
            try:
                # Check if an Article with the same link already exists
                target_article   = Article.objects.get(link=url)
                summary_segments = target_article.summary.split(CHAT_SEP)

                # Initialize history as empty if no previous conversation
                history = pairwise([url, *summary_segments])

                # Get the summary from LLM
                llm_result = self.chat_function(message=message, history=history)

                # Create and save the Article object
                target_article.summary = CHAT_SEP.join([*summary_segments, message, llm_result])
                target_article.save()

                # Return the Article object as JSON
                serializer = ArticleSerializer(target_article)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Request failed: {e}")
                return Response({'error': f"Request failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Article.DoesNotExist:
                return Response({'error': 'Article does not exist'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"An error occurred: {e}")
                return Response({'error': f"An error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

################################################################################################################################
# 그래프 관련 API 날리는 View
class KnowledgeGraphView(APIView):
    def chat_function(self, message, history):
        new_messages = get_history(history)
        new_messages.append({"role": "user", "content": message})

        stream = client.chat.completions.create(
            model="meta-llama-3-70b-instruct",
            messages=new_messages,
            stream=True,
        )
        res = ""
        for chunk in stream:
            res += chunk.choices[0].delta.content or ""
        return res

    def get(self, request, *args, **kwargs):
        concepts = Concept.objects.all()
        nodes, edges = [], []
        
        for concept in concepts:
            nodes.append({
                "id": concept.id,
                "name": concept.name,
                "description": concept.description,
                "priority": concept.priority,
                "comp_score": concept.comp_score
            })
            
            for related_concept in concept.related_concepts.all():
                if concept.id < related_concept.id:  # Avoid duplicating edges in an undirected graph
                    edges.append({
                        "source": concept.id,
                        "target": related_concept.id
                    })
        
        graph_data = { "nodes": nodes, "links": edges }
        return Response({'graph': graph_data}, status=status.HTTP_200_OK)
            
    def post(self, request, *args, **kwargs):
        # TODO: Prompt를 구성해서 LLM 호출하여 Update할 정보를 얻고, 처리한 후, DB 업데이트
        url = request.data.get('url')
        try:
            target_article   = Article.objects.get(link=url)
            summary_segments = target_article.summary.split(CHAT_SEP)
            # 1. Prompt 구성 ################################################################################################################
            # 1-1. DB로부터 Concepts 불러오기.
            concept_db_explain = GRAPH_EXPLAIN_DB

            concepts = Concept.objects.all()
            if concepts.count() != 0:
                for concept in concepts:
                    related_concepts = concept.related_concepts.all()
                    related_names = ', '.join([rc.name for rc in related_concepts])
                    concept_db_explain += f"{concept.name} {TABLE_SEP} {concept.description} {TABLE_SEP} {related_names}\n"
            else:
                concept_db_explain += GRAPH_EMPTY_DB
            concept_db_explain += GRAPH_END_OF_EXPLAIN_DB
            
            # 1-2. Target Article에 대한 Chatting History를 History로 구축하기.
            url_with_prompt = PROMPT_FOR_URL.format(url=url)
            history = pairwise([url_with_prompt, *summary_segments])

            # 1-3. Send an API call.
            message = PROMPT_FOR_GRAPH(middle_current_db=concept_db_explain, middle_current_article=summary_segments[0])
            llm_result = self.chat_function(message, history)
            # print(llm_result)
            
            # 1-4. JSON으로 불러오기.
            # Use regex to find the JSON part
            match = re.search(r'\{.*\}', llm_result, re.DOTALL)

            if match:
                json_string = match.group(0)
                # Parse the JSON string into a Python dictionary
                data = json.loads(json_string)
                # Print the extracted JSON data
                # print(json.dumps(data, indent=2))
                # store the data in the data.json file, if the file path does not exist, it will be created.
                with open('data.json', 'w') as f:
                    json.dump(data, f, indent=2)
            else:
                return Response({'error': "No JSON data found"}, status=status.HTTP_400_BAD_REQUEST)

            # 2. After LLM Inference ################################################################################################################
            # data에서 super_concepts 를 일단 뽑아낸 다음에 이미 있는 super_concept인지 확인 후 없으면 새롭게 생성하기.
            for super_concept in data['super_concepts']:
                #SuperConcept object 에서 name으로 검색
                super_concept_name = super_concept['name']
                if not SuperConcept.objects.filter(name=super_concept_name).exists():
                    new_super_concept = SuperConcept.objects.create(name=super_concept_name)
        
            
            # first, create the concept object if it does not exist
            for super_concept in data['super_concepts']:
                new_super_concept = SuperConcept.objects.get(name=super_concept['name'])
                for concept in super_concept['concepts']:
                    concept_name = concept['name']
                    description = concept['description']
                    priority = concept.get('priority', 0)
                    comp_score = concept.get('comp_score', 0)
                    #check if the concept already exists
                    if not Concept.objects.filter(name=concept_name).exists():
                        #make openai embedding using the data of name and description
                        input_embedding = f"{concept_name} {description}"
                        response = client_openai.embeddings.create(
                            input=input_embedding,
                            model="text-embedding-3-small"
                        )
                        vector_representation = response.data[0].embedding
                        print("vector_representation: ", vector_representation)
                        new_concept = Concept.objects.create(name=concept_name, description=description, priority=priority, comp_score=comp_score, vector_representation=vector_representation)
                        new_super_concept.concepts.add(new_concept)
                    else:
                        #update the description, priority, and comp_score
                        new_concept = Concept.objects.get(name=concept_name)
                        new_concept.description = description
                        input_embedding = f"{concept_name} {description}"
                        response = client_openai.embeddings.create(
                            input=input_embedding,
                            model="text-embedding-3-small"
                        )
                        vector_representation = response.data[0].embedding
                        print("vector_representation: ", vector_representation)
                        new_concept.vector_representation = vector_representation
                    new_concept.save()
                new_super_concept.save()

            
    
            #Second, add the relationship between the concepts
            for super_concept in data['super_concepts']:
                for concept in super_concept['concepts']:
                    #마찬가지로 이미 있는 concept인지 확인 후 없으면 새롭게 생성.
                    concept_name = concept['name']
                    #related_concepts 는 이미 있는 concept일수도 있고 새롭게 만들어지는 concept일 수도 있음.
                    related_concepts = concept['related_concepts']
                    print("related_concepts of ", concept_name, " : ", related_concepts)
                    existing_concept = Concept.objects.get(name=concept_name)
                    for related_concept_name in related_concepts:
                        #check if related concept already exists
                        if not Concept.objects.filter(name=related_concept_name).exists():
                            input_embedding = f"{related_concept_name}"
                            response = client_openai.embeddings.create(
                                input=input_embedding,
                                model="text-embedding-3-small"
                            )
                            vector_representation = response.data[0].embedding
                            new_related_concept = Concept.objects.create(name=related_concept_name, vector_representation=vector_representation)
                            existing_concept.related_concepts.add(new_related_concept)
                        else:
                            existing_related_concept = Concept.objects.get(name=related_concept_name)
                            existing_concept.related_concepts.add(existing_related_concept)
                    existing_concept.save()  
            return Response({}, status=status.HTTP_201_CREATED)
        except Article.DoesNotExist:
            return Response({'error': 'Article does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    def build_knowledge_graph(self, concepts):
        try:
            G = nx.DiGraph()
            for i, concept in enumerate(concepts[:20]):
                G.add_node(concept, label=concept)
                if i > 0:
                    G.add_edge(concepts[i-1], concept)
            return G
        except Exception as e:
            logger.error(f"Error building knowledge graph: {e}")
            raise


##### Knowledge Graph 기반으로 대화하는 View################################################################################################################################
class KnowledgeGraphChatListView(APIView):
    
    #super_concept_id 에 속해있는 채팅룸들의 리스트를 전부 반환
    def get(self, request, *args, **kwargs):
        # Response type = [{"name":"article1", "id":]
        super_concept_id = request.data.get('super_concept_id')
        try:
            chat_rooms = UserChattingRoom.objects.filter(super_concept_id=super_concept_id)
            chat_room_names = [{'name': chat_room.name, 'id': chat_room.id} for chat_room in chat_rooms]
            return Response({ 'chats': chat_room_names}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"An error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    ## 채팅방을 만드는 함수
    def post(self, request, *args, **kwargs):
        super_concept_id = request.data.get('super_concept_id')
        #create the new chat room with the super_concept_id
        new_chat_room = UserChattingRoom.objects.create(super_concept_id=super_concept_id)
        new_chat_room.save()
        return Response({'id': new_chat_room.id, 'name': new_chat_room.name}, status=status.HTTP_201_CREATED)        
    
    
        

class KnowledgeGraphChatDetailView(APIView):
    def chat_function(self, message, prompt):
        new_messages=[]
        new_messages.append({"role":"assistant", "content": prompt})
        new_messages.append({"role": "user", "content": message})

        stream = client.chat.completions.create(
            model="meta-llama-3-70b-instruct",
            messages=new_messages,
            stream=True,
        )
        res = ""
        for chunk in stream:
            res += chunk.choices[0].delta.content or ""
        return res

    def check_vector_similarity(self, vector1, vector2):
        return np.dot(vector1, vector2) / (np.linalg.norm(vector1) * np.linalg.norm(vector2))
    
    def select_K_concepts(self, concepts, K, vector_representation):
        # calculate the similarity between the vector_representation and the vector_representation of each concept
        similarity_scores = []
        for concept in concepts:
            similarity_score = self.check_vector_similarity(vector_representation, concept.vector_representation)
            similarity_scores.append(similarity_score)
        # sort the concepts based on the similarity scores
        sorted_concepts = [concept for _, concept in sorted(zip(similarity_scores, concepts), reverse=True)]
        return sorted_concepts[:K]
    
    
    def get(self, request, *args, **kwargs):
        try:
            articles = Article.objects.all()
            # article_names = [{'name': article.name} for article in articles]
            article_names = [article.name for article in articles]
            return Response({ 'chats': article_names}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            return Response({'error': f"An error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    ## user가 대화를 거는 경우
    def post(self, request, *args, **kwargs):
        message = request.data.get('message')
        id = request.data.get('id')
        if not message or not id:
            return Response({'error': 'Message, Chat ID, and Superconcept ID are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the chat history by chat_id
        try :
            chat_room = UserChattingRoom.objects.get(id=id)
        except UserChattingRoom.DoesNotExist:
            return Response({'error': 'Chat history does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        history = chat_room.chat_history # 이전에 대화했었던 대화 기록을 가져옴.
        superconcept_id = chat_room.super_concept.id
        
        # Embedding the user's message
        response = client_openai.embeddings.create(
            input=message,
            model="text-embedding-3-small"
        )
        
        # select the K concepts based on the similarity scores
        K = 5
        vector_representation = response.data[0].embedding
        superconcept = SuperConcept.objects.get(id=superconcept_id)
        concepts = superconcept.concepts.all()
        #select
        if(K < len(concepts)):
            selected_concepts = self.select_K_concepts(concepts, K, vector_representation)
        else:
            selected_concepts = concepts
            K = len(concepts)
        
        # Get the {name, description} of the selected concepts
        selected_concepts_info = []
        for concept in selected_concepts:
            selected_concepts_info.append({"name": concept.name, "description": concept.description})

        # Convert selected_concepts_into a string
        concepts_str = ""
        for concept in selected_concepts_info:
            concepts_str += f"{concept['name']} {TABLE_SEP} {concept['description']}\n"
            
        history_processed = get_history(history)
        
        prompt = CHAT_ROOM + concepts_str + CHAT_MIDDLE + history_processed + CHAT_END
            
        llm_result = self.chat_function(message, prompt)
        
        # Update the chat history
        chat_room.chat_history += f"{message}\n{llm_result}\n"
        chat_room.save()
        
        return Response({'response': llm_result}, status=status.HTTP_201_CREATED)