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
        # TODO: Graph에 대한 정보를 불러옴
        pass

    def post(self, request, *args, **kwargs):
        # TODO: Prompt를 구성해서 LLM 호출하여 Update할 정보를 얻고, 처리한 후, DB 업데이트
        pass

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

