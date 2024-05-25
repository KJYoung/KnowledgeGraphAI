from django.urls import path
from .views_for_api import ExtractConceptsView, KnowledgeGraphView
from .views import SuperConceptView, ConceptView
from .views_legacy import IncrementView
from .views_for_search import SearchAndRetrieveView

urlpatterns = [
    path('increment/', IncrementView.as_view(), name='increment'),
    path('chat/', ExtractConceptsView.as_view(), name='chat'),
    path('graph/', KnowledgeGraphView.as_view(), name='graph'),
    path('superconcept/', SuperConceptView.as_view(), name='super_concept'),
    path('concept/', ConceptView.as_view(), name='concept'),
    path('search/', SearchAndRetrieveView.as_view(), name='search'),
]
