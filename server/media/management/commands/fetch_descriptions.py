# management/commands/fetch_descriptions.py

from django.core.management.base import BaseCommand
from media.models import Media  # Adjust 'media' to your app name if necessary
import requests

class Command(BaseCommand):
    help = 'Fetch descriptions for media entries that lack one.'

    def handle(self, *args, **kwargs):
        media_entries = Media.objects.filter(description__isnull=True)
        
        for media in media_entries:
            self.stdout.write(f"Processing {media.title} ({media.media_type})...")
            description = self.fetch_description_from_api(media.title, media.media_type)
            if description:
                media.description = description
                media.save(update_fields=['description'])
                self.stdout.write(self.style.SUCCESS(f'Updated description for {media.title}'))
            else:
                self.stdout.write(self.style.WARNING(f'No description found for {media.title}'))

    def fetch_description_from_api(self, title, media_type):
        """Fetches the description from the appropriate API based on media type."""
        try:
            if media_type == 'video_game':
                url = f'https://api.rawg.io/api/games?key=ea05e5a7539a469f8bef014effda3748&search={title}'
                response = requests.get(url)
                response.raise_for_status()
                results = response.json().get('results', [])
                description = results[0].get('description', 'No description available.') if results else 'No description available.'
            
            elif media_type == 'anime':
                url = f'https://api.jikan.moe/v4/anime?q={title}'
                response = requests.get(url)
                response.raise_for_status()
                results = response.json().get('data', [])
                description = results[0].get('synopsis', 'No description available.') if results else 'No description available.'

            elif media_type == 'movie':
                url = f'https://api.themoviedb.org/3/search/movie?api_key=bef8b82e379ba22ebdbea803b4e245dc&query={title}'
                response = requests.get(url)
                response.raise_for_status()
                results = response.json().get('results', [])
                description = results[0].get('overview', 'No description available.') if results else 'No description available.'

            elif media_type == 'tv_show':
                url = f'https://api.themoviedb.org/3/search/tv?api_key=bef8b82e379ba22ebdbea803b4e245dc&query={title}'
                response = requests.get(url)
                response.raise_for_status()
                results = response.json().get('results', [])
                description = results[0].get('overview', 'No description available.') if results else 'No description available.'

            else:
                return None
            
            return description
        
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f"Error fetching description for {title}: {e}"))
            return None
