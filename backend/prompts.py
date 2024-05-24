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
GRAPH_INPUT = ""

GRAPH_MIDDLE = ""

# Backend가 받을 것으로 기대하는 Output 형식 기안. 
GRAPH_OUTPUT = "And"

# middle1 : 현재 Graph Database에 대한 정보
# middle2 : 현재 Target Article에 대한 정보
PROMPT_FOR_GRAPH = lambda middle1, middle2: GRAPH_INPUT + middle1 + GRAPH_MIDDLE + middle2 + GRAPH_OUTPUT

# Backend 파일에서 regex 파싱 파트 => DB(Concept) Create or Update 구분 => Execute.
# 나중에 Concepts.objects.all 불러와서 필터 => Front.