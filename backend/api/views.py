from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Concept, SuperConcept, Article
from .serializers import ConceptSerializer, SuperConceptSerializer, ArticleSerializer

class ConceptViewSet(viewsets.ModelViewSet):
    queryset = Concept.objects.all()
    serializer_class = ConceptSerializer

class SuperConceptViewSet(viewsets.ModelViewSet):
    queryset = SuperConcept.objects.all()
    serializer_class = SuperConceptSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

# SuperConcept List
class SuperConceptView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            super_concepts = SuperConcept.objects.all()
            # article_names = [{'name': article.name} for article in articles]
            super_concept_names = [super_concept.name for super_concept in super_concepts]
            return Response({ 'super_concepts': super_concept_names}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"An error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Concept List
class ConceptView(APIView):
    def put(self, request, *args, **kwargs):
        update_obj = request.data
        try:
            target_concept = Concept.objects.get(pk=update_obj.get('id'))
            target_concept.description = update_obj.get('description')
            target_concept.priority = update_obj.get('priority')
            target_concept.comp_score = update_obj.get('comp_score')
            target_concept.save()
            return Response({ 'status': 'success' }, status=status.HTTP_200_OK)
        except Concept.DoesNotExist:
            return Response({'error': 'Concept does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"An error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)