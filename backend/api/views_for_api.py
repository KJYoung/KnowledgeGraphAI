CHAT_SEP = "<|THISISCHATSEP|>"

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
from .models import Article
from .serializers import ArticleSerializer
from prompts import PROMPT_FOR_URL
import re

# Load environment variables from .env file
load_dotenv()
FRIENDLI_TOKEN = os.getenv('FRIENDLI_TOKEN')
print(FRIENDLI_TOKEN)
client = Friendli(token=FRIENDLI_TOKEN)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

################################################################################################################################

# 처음 URL로부터 정보 얻고, 그에 대한 대화 나누는 View
class ExtractConceptsView(APIView):
    def chat_function(self, message, history):
        new_messages = []
        for user, chatbot in history:
            new_messages.append({"role": "user", "content": user})
            new_messages.append({"role": "assistant", "content": chatbot})
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
            def pairwise(iterable):
                a = iter(iterable)
                return list(zip(a, a))  
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
        new_messages = []
        for user, chatbot in history:
            new_messages.append({"role": "user", "content": user})
            new_messages.append({"role": "assistant", "content": chatbot})
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
        data = request.data
        super_concepts = data['super_concepts']
        user_concepts = []
        for super_conept in super_concepts:
            name = super_concept['name']
            #find the concept which has the super_conept of name
            concept = Concept.objects.get(super_concepts__name=name)
            user_concepts.append(concept)
        # 클라이언트에게 data 보내기
        return Response({'super_concepts': super_concepts, 'user_concepts': user_concepts}, status=status.HTTP_200_OK)
            
    def post(self, request, *args, **kwargs):
        #graph_data.json 파일을 읽는 것으로 임시 처리
        with open('post_graph_data.json', 'r') as f:
            data = f.read()
        # data에서 super_concepts 를 일단 뽑아낸 다음에 이미 있는 super_concept인지 확인 후 없으면 새롭게 생성하기.
        for super_concept in data['super_concepts']:
            print(super_concept)
            #SuperConcept object 에서 name으로 검색
            super_concept_name = super_concept['name']
            if not SuperConcept.objects.filter(name=super_concept_name).exists():
                new_super_concept = SuperConcept(name=super_concept_name)
                new_super_concept.save()
                for concept in super_concept['concepts']:
                    #마찬가지로 이미 있는 concept인지 확인 후 없으면 새롭게 생성.
                    concept_name = concept['name']
                    #related_concepts 는 이미 있는 concept일수도 있고 새롭게 만들어지는 concept일 수도 있음.
                    related_concepts = concept['related_concepts']
                    if not Concept.objects.filter(name=concept_name).exists():
                        new_concept = Concept(name=concept_name, description=concept['description'], comp_score=concept['comp_score'])
                        for related_concept_name in related_concepts:
                            if not Concept.objects.filter(name=related_concept_name).exists():
                                new_related_concept = Concept(name=related_concept_name)
                                new_related_concept.save()
                                new_concept.related_concepts.add(new_related_concept)
                            else:
                                existing_concept = Concept.objects.get(name=related_concept_name)
                                new_concept.related_concepts.add(existing_concept)
                        new_concept.save()
                        new_super_concept.concepts.add(new_concept)
                    else:
                        existing_concept = Concept.objects.get(name=concept_name)
                        for related_concept_name in related_concepts:
                            if not Concept.objects.filter(name=related_concept_name).exists():
                                new_related_concept = Concept(name=related_concept_name)
                                new_related_concept.related_concepts.add(existing_concept)
                                new_related_concept.save()
                                existing_concept.related_concepts.add(new_related_concept)
                            else:
                                existing_related_concept = Concept.objects.get(name=related_concept_name)
                                existing_related_concept.related_concepts.add(existing_concept)
                                existing_related_concept.save()
                                existing_concept.related_concepts.add(existing_related_concept)
                        existing_concept.save()
                        new_super_concept.concepts.add(existing_concept)

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

# url을 llm 에게 넘겨주고 concept 을 반환했을 때 의 interface json 형식
# related_concepts 은 새롭게 생성된 것이 아니라 input으로 넘겨준 내 기존의 concept들 중에서 가져온 것 혹은 새롭게 생성된 것.
# 처음 graph 를 구축할 때는 llm_api 를 두번 call 해서 concept 한 번 뽑아내고 뽑혀진 concept 로 related concept를 선정하던가 다른 형식의 prompt 쓰면 될 것 같음.
# {
#     "url": "https://www.example.com",
#     "super_concepts": [
#         {
#             "name": "superconcept1",
#             "concepts": [
#                 { 
#                     "name": "concept1",
#                     "description": "description1",
#                     "comp_score": 0.5,
#                     "prior_concepts": ["prior1", "prior2"],
#                     "related_concepts": ["related1", "related2"]
#                 },
#                 {
#                     "name": "concept2",
#                     "description": "description2",
#                     "comp_score": 0.7,
#                     "prior_concepts": ["prior1", "prior2"],
#                     "related_concepts": ["related1", "related2"]
#                 }
#             ]
#         },
#         {
#             "name": "superconcept2",
#             "concepts": [
#                 {
#                     "name": "concept3",
#                     "description": "description3",
#                     "comp_score": 0.3,
#                     "prior_concepts": ["prior1", "prior2"],
#                     "related_concepts": ["related1", "related2"]
#                 },
#                 {
#                     "name": "concept4",
#                     "description": "description4",
#                     "comp_score": 0.8,
#                     "prior_concepts": ["prior1", "prior2"],
#                     "related_concepts": ["related1", "related2"]
#                 }
#             ]
#         }
# }
