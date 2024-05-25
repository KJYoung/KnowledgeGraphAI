from django.urls import path
from .views_for_api import ExtractConceptsView, KnowledgeGraphView
from .views import SuperConceptView
from .views_legacy import IncrementView

urlpatterns = [
    path('increment/', IncrementView.as_view(), name='increment'),
    path('chat/', ExtractConceptsView.as_view(), name='chat'),
    path('graph/', KnowledgeGraphView.as_view(), name='graph'),
    path('superconcept/', SuperConceptView.as_view(), name='super_concept')
]
