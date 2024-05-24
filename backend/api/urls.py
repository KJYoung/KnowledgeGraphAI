from django.urls import path
from .views_for_api import ExtractConceptsView, KnowledgeGraphView
from .views_legacy import IncrementView

urlpatterns = [
    path('increment/', IncrementView.as_view(), name='increment'),
    path('chat/', ExtractConceptsView.as_view(), name='chat'),
    path('graph/', KnowledgeGraphView.as_view(), name='graph'),
]
