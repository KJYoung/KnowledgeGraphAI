from django.urls import path
from .views_for_api import ExtractConceptsView, KnowledgeGraphView, KnowledgeGraphChatListView, KnowledgeGraphChatDetailView
from .views import SuperConceptView, ConceptView
from .views_legacy import IncrementView

urlpatterns = [
    path('increment/', IncrementView.as_view(), name='increment'),
    path('chat/', ExtractConceptsView.as_view(), name='chat'),
    path('graph/', KnowledgeGraphView.as_view(), name='graph'),
    path('superconcept/', SuperConceptView.as_view(), name='super_concept'),
    path('graph_chat_list/', KnowledgeGraphChatListView.as_view(), name='graph_chat'),
    path('graph_chat_detail/', KnowledgeGraphChatDetailView.as_view(), name='graph_chat_detail'),
    path('concept/', ConceptView.as_view(), name='concept'),
]
