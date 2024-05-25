from django.contrib import admin
from .models import Concept, SuperConcept, Article

@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    list_display = ('pk', 'name', 'priority', 'created_at', 'modified_at')
    search_fields = ('name', 'description')

@admin.register(SuperConcept)
class SuperConceptAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'modified_at')
    search_fields = ('name',)

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('name', 'link', 'created_at', 'modified_at')
    search_fields = ('name', 'link')