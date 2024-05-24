from django.core.management.base import BaseCommand
from api.models import Article

class Command(BaseCommand):
    help = 'Deletes all Article objects from the database'

    def handle(self, *args, **kwargs):
        # Get the count of articles to be deleted
        article_count = Article.objects.count()
        
        # Delete all articles
        Article.objects.all().delete()
        
        # Print the result
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {article_count} articles'))
