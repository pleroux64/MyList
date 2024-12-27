# fetch_single_game_description.py

from django.core.management.base import BaseCommand
import requests

class Command(BaseCommand):
    help = 'Fetch the description for a single video game from the RAWG API.'

    def add_arguments(self, parser):
        parser.add_argument('title', type=str, help='Title of the video game to fetch.')

    def handle(self, *args, **options):
        title = options['title']
        api_key = 'ea05e5a7539a469f8bef014effda3748'  # Use your actual API key
        url = f'https://api.rawg.io/api/games?key={api_key}&search={title}'

        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()

            # Print the entire response data to inspect the structure
            self.stdout.write(self.style.SUCCESS(f'Full API response for "{title}":'))
            self.stdout.write(str(data))

            # Attempt to fetch the description
            game = data.get('results', [{}])[0]  # Safely access the first game result
            description = game.get('description') or 'No description available.'
            
            self.stdout.write(self.style.SUCCESS(f'Description for "{title}": {description}'))

        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f"Error fetching description for '{title}': {e}"))
