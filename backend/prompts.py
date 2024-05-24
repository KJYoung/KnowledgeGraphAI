# prompt for summary.
REQUEST_SUMMARY = "First, Read the following document: {url}. \
                   Then, summarize it, using the template below. \
                    - Introduction \
                    - Key Points \
                    - Technical Details \
                    - Conclusion \n"

REQUEST_KEYWORDS = "And list up to 5 keywords that encapsulate \
                    the document's main notions and specific details. \n"

REQUEST_DESCRIPTION = "Lastly, describe about the keywords. \n"

PROMPT_FOR_URL = REQUEST_SUMMARY + REQUEST_KEYWORDS + REQUEST_DESCRIPTION
