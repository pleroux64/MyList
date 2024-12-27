# management/commands/clear_descriptions.py

from django.core.management.base import BaseCommand
from media.models import Media  # Replace 'myapp' with your actual app name

class Command(BaseCommand):
    help = 'Clear descriptions for all media entries.'

    def handle(self, *args, **kwargs):
        Media.objects.update(description=None)  # Set all descriptions to null
        self.stdout.write(self.style.SUCCESS('All media descriptions cleared.'))