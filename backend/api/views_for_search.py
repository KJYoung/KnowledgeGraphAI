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
    GRAPH_EXPLAIN_DB, GRAPH_EMPTY_DB, GRAPH_END_OF_EXPLAIN_DB,
)
import re, json

import getpass
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()
FRIENDLI_TOKEN = os.getenv('FRIENDLI_TOKEN')
print(FRIENDLI_TOKEN)
client = Friendli(token=FRIENDLI_TOKEN)
client = OpenAI(base_url="https://inference.friendli.ai/v1", api_key=FRIENDLI_TOKEN)

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

API_KEY = "AIzaSyBQBJa3fdZBhC2ik5pMvZhG7_ZXwlQfr0s"
CX = "957ebf10432de4dce"

def search_web(query):
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={API_KEY}&cx={CX}"
    response = requests.get(url)
    results = response.json()
    return results['items']

def search_and_retrieve(keyword):
    # print("\n\n--keyword to search: ", keyword)
    search_results = search_web(keyword)
    res = ""
    for result in search_results:
        res += f"Title: {result['title']}\n"
        res += f"Link: {result['link']}\n"
        res += f"Snippet: {result['snippet']}\n"
    # print("\n\n--search and retrieve results\n", res)
    return res
##############################################################################################################################

class SearchAndRetrieveView(APIView):
    
    def call_search_and_retrieve(self, history):
        print("\n\n **check** \n\n")
        new_messages = get_history(history)
        new_messages.append(
            {"role": "user", "content": "Please find a keyword to search additional references from google search, considering our chats."}
        )
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "search_and_retrieve",
                    "description": "Search and retrieve the resources relevant with the subject that user is studying by searching the keyword in google.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "keyword": {
                                "type": "string",
                                "description": "A keyword about the subject that user is studying. The keyword has to be proper to be searched in google."
                            }
                        }
                    }
                }
            }
        ]
        chat = client.chat.completions.create(
            model="mistral-7b-instruct-v0-3",
            messages=new_messages,
            tools=tools,
            temperature=0,
            frequency_penalty=1,
        )
        print(chat)
        
        try:
            func_kwargs = json.loads(chat.choices[0].message.tool_calls[0].function.arguments)
        except:
            print("Hey!!")
        
        recom_results = search_and_retrieve(**func_kwargs)
        new_messages.append(
            {"role": "user", "content": "Please recommend me some good additional materials for reference."}
        )
        new_messages.append(
            {
                "role": "assistant",
                "tool_calls": [
                    tool_call.model_dump()
                    for tool_call in chat.choices[0].message.tool_calls
                ]
            }
        )
        new_messages.append(
            {
                "role": "tool",
                "content": "list up the following recommandations [You must keep the URL with the format of %%url%%({url}) ]:\n" + str(recom_results),
                "tool_call_id": chat.choices[0].message.tool_calls[0].id
            }
        )
        chat_w_info = client.chat.completions.create(
            model="mistral-7b-instruct-v0-3",
            tools=tools,
            messages=new_messages,
        )
        return chat_w_info.choices[0].message.content

    def post(self, request, *args, **kwargs):
        url = request.data.get('url')
        try:
            # Check if an Article with the same link already exists
            target_article   = Article.objects.get(link=url)
            summary_segments = target_article.summary.split(CHAT_SEP)

            # Initialize history as empty if no previous conversation
            url_with_prompt = PROMPT_FOR_URL.format(url=url)
            history = pairwise([url_with_prompt, *summary_segments])

            # Get the summary from LLM
            llm_result = self.call_search_and_retrieve(history=history)
            # llm_result.choices[0].message.content
            # print("\n\n== call_search_and_retrieve results == \n", llm_result.choices[0].message.content)

            # Create and save the Article object
            target_article.summary = CHAT_SEP.join([*summary_segments, "Please give me additional references.", llm_result])
            target_article.save()

            # Return the Article object as JSON
            serializer = ArticleSerializer(target_article)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return Response({'error': f"Request failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Article.DoesNotExist:
            return Response({'error': 'Article does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        # except Exception as e:
        #     logger.error(f"An error occurred: {e}")
        #     return Response({'error': f"An error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # def post_for_chat_id(self, request, *args, **kwargs):
    #     id = request.data.get('id')
    #     if not id:
    #         return Response({'error': 'Message, Chat ID, and Superconcept ID are required'}, status=status.HTTP_400AD_REQUEST)
    #     # Get the chat history by chat_id
    #     try :
    #         chat_room = UserChattingRoom.objects.get(id=id)
    #     except UserChattingRoom.DoesNotExist:
    #         return Response({'error': 'Chat history does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    #     history = chat_room.chat_history # 이전에 대화했었던 대화 기록을 가져옴.

    #     try:
    #         # Check if an Article with the same link already exists
    #         target_article   = Article.objects.get(link=url)
    #         summary_segments = target_article.summary.split(CHAT_SEP)

    #         # Initialize history as empty if no previous conversation
    #         url_with_prompt = PROMPT_FOR_URL.format(url=url)
    #         history = pairwise([url_with_prompt, *summary_segments])

    #         # Get the summary from LLM
    #         llm_result = self.call_search_and_retrieve(history=history)
    #         # llm_result.choices[0].message.content
    #         # print("\n\n== call_search_and_retrieve results == \n", llm_result.choices[0].message.content)

    #         # Create and save the Article object
    #         target_article.summary = CHAT_SEP.join([*summary_segments, llm_result])
    #         target_article.save()

    #         # Return the Article object as JSON
    #         serializer = ArticleSerializer(target_article)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
            
    #     except requests.exceptions.RequestException as e:
    #         logger.error(f"Request failed: {e}")
    #         return Response({'error': f"Request failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    #     except Article.DoesNotExist:
    #         return Response({'error': 'Article does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    #     except Exception as e:
    #         logger.error(f"An error occurred: {e}")
    #         return Response({'error': f"An error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)