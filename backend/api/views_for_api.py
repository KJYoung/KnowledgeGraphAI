CHAT_SEP = "<|THISISCHATSEP|>"

# api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import spacy
import networkx as nx
import json
import logging
import os
import gradio as gr
from friendli import Friendli
from dotenv import load_dotenv
from .models import Article
from .serializers import ArticleSerializer

# Load environment variables from .env file
load_dotenv()
FRIENDLI_TOKEN = os.getenv('FRIENDLI_TOKEN')
client = Friendli(token=FRIENDLI_TOKEN)

# Load spaCy model
nlp = spacy.load('en_core_web_sm')

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
                llm_result = self.chat_function(message=url, history=history)

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

    def extract_concepts(self, text):
        try:
            doc = nlp(text)
            concepts = [chunk.text for chunk in doc.noun_chunks]
            return concepts
        except Exception as e:
            logger.error(f"Error extracting concepts: {e}")
            raise

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


class IncrementView(APIView):
    def post(self, request, *args, **kwargs):
        number = request.data.get('number')
        if number is not None:
            incremented_number = number + 10
            return Response({'result': incremented_number}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid input'}, status=status.HTTP_400_BAD_REQUEST)