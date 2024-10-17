from django.core.management.base import BaseCommand
import requests
from media.models import Media

class Command(BaseCommand):
    help = 'Fetch popular video games from RAWG.io API and Naruto from Jikan API and store them in the database'

    def handle(self, *args, **kwargs):
        # First, fetch video games from RAWG.io API
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

        # Now fetch Naruto from Jikan API
        naruto_query = 'Naruto'
        jikan_url = f'https://api.jikan.moe/v4/anime?q={naruto_query}&limit=1'

        try:
            response = requests.get(jikan_url)
            response.raise_for_status()  # Raises an error for bad responses

            anime = response.json().get('data', [])[0]  # Get the first result from the response

            # Extract the image URL and title
            title = anime.get('title')
            image_url = anime.get('images', {}).get('jpg', {}).get('image_url')

            # Check if the anime already exists in the database
            if not Media.objects.filter(title=title, media_type='anime').exists():
                # Save the anime in the database
                Media.objects.create(
                    title=title,
                    media_type='anime',
                    image_url=image_url,
                    rating=0  # Set default rating to 0 until users rate it
                )

            self.stdout.write(self.style.SUCCESS(f'Successfully fetched and stored {title} from Jikan API'))
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Failed to fetch Naruto data from Jikan API: {e}'))
