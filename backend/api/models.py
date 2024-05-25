from django.db import models

class AbstractTag(models.Model):
    name = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Concept(AbstractTag):
    priority = models.IntegerField()
    description = models.TextField()
    comp_score = models.IntegerField()

    prior_concepts = models.ManyToManyField('self', symmetrical=False, related_name='prerequisites', blank=True)
    related_concepts = models.ManyToManyField('self', symmetrical=False, related_name='related_to', blank=True)

class SuperConcept(AbstractTag):
    concepts = models.ManyToManyField(Concept, related_name='super_concepts')

class Article(AbstractTag):
    concepts = models.ManyToManyField(Concept, related_name='articles')
    summary = models.TextField()
    link = models.URLField(max_length=200)
