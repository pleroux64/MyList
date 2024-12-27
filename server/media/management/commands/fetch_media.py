from django.core.management.base import BaseCommand
import requests
from media.models import Media

class Command(BaseCommand):
    help = 'Fetch popular media items from various APIs and store them in the database'

    def handle(self, *args, **kwargs):
        self.fetch_video_games()
        self.fetch_anime()
        self.fetch_movies()
        self.fetch_tv_shows()
        self.stdout.write(self.style.SUCCESS('Media fetching and storing process completed.'))

def fetch_video_games(self):
    api_key = 'ea05e5a7539a469f8bef014effda3748'
    url = f'https://api.rawg.io/api/games?key={api_key}&ordering=-rating&page_size=10'

    try:
        response = requests.get(url)
        response.raise_for_status()

        games = response.json().get('results', [])
        for game in games:
            # Fetch the detailed information using the game's ID to get the description
            game_id = game.get('id')
            detail_url = f'https://api.rawg.io/api/games/{game_id}?key={api_key}'
            detail_response = requests.get(detail_url)
            detail_response.raise_for_status()

            game_details = detail_response.json()
            description = game_details.get('description', 'No description available.')

            # Create or update the Media object
            if not Media.objects.filter(title=game.get('name'), media_type='video_game').exists():
                Media.objects.create(
                    title=game.get('name'),
                    media_type='video_game',
                    image_url=game.get('background_image', 'default-placeholder-image-url.jpg'),
                    description=description,
                    rating=0  # Set default rating to 0
                )
            self.stdout.write(self.style.SUCCESS(f"Fetched and stored details for {game.get('name')}"))

    except requests.RequestException as e:
        self.stdout.write(self.style.ERROR(f'Failed to fetch video games: {e}'))

    def fetch_anime(self):
        jikan_url = 'https://api.jikan.moe/v4/anime?limit=10'  # Fetch popular anime

        try:
            response = requests.get(jikan_url)
            response.raise_for_status()

            anime_list = response.json().get('data', [])
            for anime in anime_list:
                title = anime.get('title')
                if not Media.objects.filter(title=title, media_type='anime').exists():
                    Media.objects.create(
                        title=title,
                        media_type='anime',
                        image_url=anime.get('images', {}).get('jpg', {}).get('image_url', 'default-placeholder-image-url.jpg'),
                        rating=0  # Set default rating to 0
                    )
            self.stdout.write(self.style.SUCCESS('Anime fetched and stored successfully.'))

        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Failed to fetch anime: {e}'))

    def fetch_movies(self):
        api_key = 'bef8b82e379ba22ebdbea803b4e245dc'
        url = f'https://api.themoviedb.org/3/movie/popular?api_key={api_key}&language=en-US&page=1'

        try:
            response = requests.get(url)
            response.raise_for_status()

            movies = response.json().get('results', [])
            for movie in movies:
                if not Media.objects.filter(title=movie.get('title'), media_type='movie').exists():
                    Media.objects.create(
                        title=movie.get('title'),
                        media_type='movie',
                        image_url=f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}" if movie.get('poster_path') else 'default-placeholder-image-url.jpg',
                        rating=0  # Set default rating to 0
                    )
            self.stdout.write(self.style.SUCCESS('Movies fetched and stored successfully.'))

        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Failed to fetch movies: {e}'))

    def fetch_tv_shows(self):
        api_key = 'bef8b82e379ba22ebdbea803b4e245dc'
        url = f'https://api.themoviedb.org/3/tv/popular?api_key={api_key}&language=en-US&page=1'

        try:
            response = requests.get(url)
            response.raise_for_status()

            tv_shows = response.json().get('results', [])
            for show in tv_shows:
                if not Media.objects.filter(title=show.get('name'), media_type='tv_show').exists():
                    Media.objects.create(
                        title=show.get('name'),
                        media_type='tv_show',
                        image_url=f"https://image.tmdb.org/t/p/w500{show.get('poster_path')}" if show.get('poster_path') else 'default-placeholder-image-url.jpg',
                        rating=0  # Set default rating to 0
                    )
            self.stdout.write(self.style.SUCCESS('TV shows fetched and stored successfully.'))

        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Failed to fetch TV shows: {e}'))
