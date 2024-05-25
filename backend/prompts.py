import json

CHAT_SEP = "<|THISISCHATSEP|>"  # Separator for separating User & AI in the Article.Summary Field
TABLE_SEP = "%TS%"            # Separator for separating different fields in describing Knowledge Concept DB 

# prompt for summary.
REQUEST_SUMMARY = "First, Read the following document: {url}. \
                   Then, summarize it, using the template below. \
                    - Title \
                    - Introduction \
                    - Key Points \
                    - Technical Details \
                    - Conclusion \n"

REQUEST_KEYWORDS = "And list and explain up to 5 keywords that encapsulate \
                    the document's main notions and specific details like the below. \
                    - Keywords \
                      1. [keyword 1]: \
                      2. [keyword 2]: \
                      3.  ... \
                    If a keyword is too abstract to capture the main concept and details, \
                    it doesn't need to be listed \n"

PROMPT_FOR_URL = REQUEST_SUMMARY + REQUEST_KEYWORDS

# prompt for Knowledge Node Extraction
GRAPH_INPUT = "You are an AI tasked with updating the Knowledge Graph based on the current database and a new target article. \
               Your job is to analyze the given information, identify new concepts, and update existing ones.\n\n"

GRAPH_MIDDLE = "Now, please consider the following new article to update the Knowledge Graph:\n\n"

# Backend가 받을 것으로 기대하는 Output 형식 기안.
example_output = {
    "super_concepts": [
        {
            "name": "superconcept1",
            "concepts": [
                {
                    "name": "concept1",
                    "description": "description1",
                    "related_concepts": ["related1", "related2"]
                },
                {
                    "name": "concept2",
                    "description": "description2",
                    "related_concepts": ["related1", "related2"]
                }
            ]
        },
        {
            "name": "superconcept2",
            "concepts": [
                {
                    "name": "concept3",
                    "description": "description3",
                    "related_concepts": ["related1", "related2"]
                },
                {
                    "name": "concept4",
                    "description": "description4",
                    "related_concepts": ["related1", "related2"]
                }
            ]
        }
    ]
}

GRAPH_OUTPUT = f"The output should only the JSON format text with the same format as below:\n\n {json.dumps(example_output)} \n\n The output should be fine when be given to `data = json.loads({{your output}})`"

# middle_current_db : 현재 Graph Database에 대한 정보
GRAPH_EXPLAIN_DB = f"The followings are the database of the concepts for Knowledge Graph. The format is organized as {{name}} {TABLE_SEP} {{description}} {TABLE_SEP} {{related_name1}}, {{related_name2}}, ...\n\n. The related concepts you give must be contained in the original database or the concepts you have given in the same output. Also, your description for the concepts should be longer than 3 paragraphs at least.\n\n"
GRAPH_EMPTY_DB = f"The Database is now empty :)\n\n"
GRAPH_END_OF_EXPLAIN_DB = f"Okay. This is the end of the database.\n\n"
# middle_current_article : 현재 Target Article에 대한 정보
PROMPT_FOR_GRAPH = lambda middle_current_db, middle_current_article: GRAPH_INPUT + middle_current_db + GRAPH_MIDDLE + middle_current_article + GRAPH_OUTPUT



CHAT_OUTPUT_EXAMPLE = {
    "chat_name": "Computer Architecture : Out of Order Execution",
    "response": "Out-of-order execution is a technique that allows a processor to execute instructions in a different order than the program specifies, as long as the final result is correct. This can improve performance by exploiting parallelism, avoiding stalls, and hiding latency."
}

# When there are multiple concepts which are related to user's input
# prompt for Chatting Room
CHAT_ROOM = "You are an AI tasked with creating a chatbot that can discuss the given topic with a user. \
        Here are the related concepts in the user's Knowledge Graph Database which you can use to generate responses. /n/n"

CHAT_MIDDLE = "Additionally, here is the chat history between the user and the chatbot. /n/n"


CHAT_OUTPUT_TYPE = f"Your output should include the response to the user's message and the appropriate name for this chat room. \
                    The output should only the JSON format text with the same format as below: /n/n. \
                    example : {json.dumps(CHAT_OUTPUT_EXAMPLE)} /n/n"
            

CHAT_END = "Please generate a response to the user's message. /n/n"

        

