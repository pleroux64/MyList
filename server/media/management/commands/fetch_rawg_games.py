from django.core.management.base import BaseCommand
import requests
from media.models import Media

class Command(BaseCommand):
    help = 'Fetch popular video games from RAWG.io API and store them in the database'

    def handle(self, *args, **kwargs):
        api_key = 'ea05e5a7539a469f8bef014effda3748'  # RAWG.io API key
        url = f'https://api.rawg.io/api/games?key={api_key}&ordering=-rating'

        try:
            response = requests.get(url)
            response.raise_for_status()  # Raises an error for bad responses

            games = response.json().get('results', [])  # Extract the list of games from the response

            for game in games:
                # Check if the game already exists in the database
                if not Media.objects.filter(title=game.get('name'), media_type='video_game').exists():
                    # Save the game in the database
                    Media.objects.create(
                        title=game.get('name'),
                        media_type='video_game',
                        image_url=game.get('background_image'),
                        rating=0  # Set default rating to 0 until users rate it
                    )

            self.stdout.write(self.style.SUCCESS('Successfully fetched and stored video games from RAWG.io'))
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Failed to fetch data from RAWG.io: {e}'))
