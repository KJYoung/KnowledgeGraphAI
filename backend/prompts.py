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
GRAPH_OUTPUT = "The output is whatever you want."

# middle_current_db : 현재 Graph Database에 대한 정보
GRAPH_EXPLAIN_DB = f"The followings are the database of the concepts for Knowledge Graph. The format is organized as {{name}} {TABLE_SEP} {{description}} {TABLE_SEP} {{related_name1}}, {{related_name2}}, ...\n\n"
GRAPH_EMPTY_DB = f"The Database is now empty :)\n\n"
GRAPH_END_OF_EXPLAIN_DB = f"Okay. This is the end of the database.\n\n"
# middle_current_article : 현재 Target Article에 대한 정보
PROMPT_FOR_GRAPH = lambda middle_current_db, middle_current_article: GRAPH_INPUT + middle_current_db + GRAPH_MIDDLE + middle_current_article + GRAPH_OUTPUT

# Backend 파일에서 regex 파싱 파트 => DB(Concept) Create or Update 구분 => Execute.
# 나중에 Concepts.objects.all 불러와서 필터 => Front.