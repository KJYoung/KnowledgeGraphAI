from django.db import models

class AbstractTag(models.Model):
    name = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Concept(AbstractTag):
    priority = models.IntegerField(blank= True, default=0)
    comp_score = models.IntegerField(blank= True, default=0)
    description = models.TextField(blank=True, default='')
    vector_representation = models.TextField(blank=True, default='')

    prior_concepts = models.ManyToManyField('self', symmetrical=False, related_name='prerequisites', blank=True)
    related_concepts = models.ManyToManyField('self', symmetrical=False, related_name='related_to', blank=True)

class SuperConcept(AbstractTag):
    concepts = models.ManyToManyField(Concept, related_name='super_concepts')

class Article(AbstractTag):
    concepts = models.ManyToManyField(Concept, related_name='articles')
    summary = models.TextField()
    link = models.URLField(max_length=200)


class UserChattingRoom(models.Model):
    chat_history = models.TextField(blank=True, default='')
    super_concept = models.ForeignKey(SuperConcept, on_delete=models.CASCADE, blank=True, null=True)
    name = models.TextField(blank=True, default='new_chat_room')
    vector_representation = models.TextField(blank=True, default='')