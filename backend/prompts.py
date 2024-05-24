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
