import os
from friendli import Friendli
from dotenv import load_dotenv
import requests

QUIT = ["q", "Q", "Quit", "quit", "quit()", "exit()", "exit"]

# Load environment variables from .env file
load_dotenv()
FRIENDLI_TOKEN = os.getenv('FRIENDLI_TOKEN')
client = Friendli(token=FRIENDLI_TOKEN)

'''def chat_function(message, history):
  new_messages = []
  for user, chatbot in history:
    new_messages.append({"role" : "user", "content": user})
    new_messages.append({"role" : "assistant", "content": chatbot})
  new_messages.append({"role": "user", "content": message})

  stream = client.chat.completions.create(
    model="meta-llama-3-70b-instruct",
    messages=new_messages,
    stream=True
  )
  res = ""
  for chunk in stream:
    res += chunk.choices[0].delta.content or ""
    yield res
'''

def extractKeywords_word(input_string):
  global client
  chat_completion = client.chat.completions.create(
    model="meta-llama-3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "Can you give me keywords related to " + input_string + "? Don't include any introductory sentence, but just include words seperated with \",\", and no other sentences"
        }
    ],
    stream=False,
  )
  return chat_completion.choices[0].message.content

def extractKeywords_URL(url):
  global client
  chat_completion = client.chat.completions.create(
    model="meta-llama-3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "Can you give me keywords at " + url + "? Don't include any introductory sentence, but just include words seperated with \",\", and no other sentences. Don't attach header or title in front of your response. Just enumerate the words."
        }
    ],
    stream=False,
  )
  return chat_completion.choices[0].message.content

def isURL(input_string):
  try:
    response = requests.get(input_string)
    return True
  except:
    return False


'''chat_completion = client.chat.completions.create(
    model="meta-llama-3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "Can you give me keywords related to LLM? Don't include any introductory sentence, but just include words seperated with \",\", and no other sentences"
        }
    ],
    stream=False,
)'''

lstKeyWords = []

while True:
  input_string = input("Enter a concept what you want to extract keywords about: ")
  if input_string in QUIT:
    print("Exiting the program")
    break
  if isURL(input_string):
    str1 = extractKeywords_URL(input_string)
  else:
    str1 = extractKeywords_word(input_string)
  print(str1)
  lstKeyWords = list(str1.replace(" ", "").split(","))
  print(lstKeyWords)
