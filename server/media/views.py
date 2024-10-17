from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Avg
from .models import UserMediaInteraction, Media
from .serializers import UserMediaInteractionSerializer, MediaSerializer
from django.contrib.auth.models import User
import requests
import logging

logger = logging.getLogger(__name__)

class UserMediaInteractionViewSet(viewsets.ModelViewSet):
    serializer_class = UserMediaInteractionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        return UserMediaInteraction.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user
        media = serializer.validated_data['media']
        existing_interaction = UserMediaInteraction.objects.filter(user=user, media=media).first()

        if existing_interaction:
            existing_interaction.status = serializer.validated_data['status']
            existing_interaction.rating = serializer.validated_data['rating']
            existing_interaction.save()
        else:
            serializer.save(user=user)

        self.update_media_rating(media)

    def update_media_rating(self, media):
        interactions = UserMediaInteraction.objects.filter(media=media)
        total_ratings = sum(interaction.rating for interaction in interactions if interaction.rating is not None)
        rating_count = interactions.filter(rating__isnull=False).count()
        average_rating = total_ratings / rating_count if rating_count > 0 else 0
        media.rating = round(average_rating, 2)
        media.save()

@api_view(['GET'])
@permission_classes([AllowAny])
def search_media(request):
    query = request.query_params.get('q', '').lower()
    media_type = request.query_params.get('media_type', '').lower()

    # First, search in the local database
    media_results = Media.objects.filter(title__icontains=query, media_type=media_type)

    # If no results found in the local database, fetch from external APIs
    if not media_results.exists():
        if media_type == 'video_game':
            # Fetch video games from RAWG API
            api_key = 'ea05e5a7539a469f8bef014effda3748'
            url = f'https://api.rawg.io/api/games?key={api_key}&search={query}'
        elif media_type == 'anime':
            # Fetch anime from Jikan API (updated to use v4)
            url = f'https://api.jikan.moe/v4/anime?q={query}'
        elif media_type == 'movie':
            # Fetch movies from TMDB API
            api_key = 'bef8b82e379ba22ebdbea803b4e245dc'  # Replace with your actual TMDB API key
            url = f'https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={query}'
        elif media_type == 'tv_show':
            # Fetch TV shows from TMDB API
            api_key = 'bef8b82e379ba22ebdbea803b4e245dc'
            url = f'https://api.themoviedb.org/3/search/tv?api_key={api_key}&query={query}'
        else:
            return Response({"error": "Invalid media type."}, status=status.HTTP_400_BAD_REQUEST)

        # Make the external API call
        try:
            response = requests.get(url)
            response.raise_for_status()

            # Handle Jikan API v4 for anime and results from other APIs
            if media_type == 'anime':
                results = response.json().get('data', [])  # Use 'data' for Jikan API (v4)
            else:
                results = response.json().get('results', [])

            # Save the fetched media to the local database
            for result in results:
                if media_type == 'video_game':
                    Media.objects.get_or_create(
                        title=result.get('name'),
                        media_type=media_type,
                        defaults={
                            'image_url': result.get('background_image', 'default-placeholder-image-url.jpg'),
                            'rating': 0
                        }
                    )
                elif media_type == 'anime':
                    Media.objects.get_or_create(
                        title=result.get('title'),
                        media_type=media_type,
                        defaults={
                            'image_url': result.get('images', {}).get('jpg', {}).get('image_url', 'default-placeholder-image-url.jpg'),
                            'rating': 0
                        }
                    )
                elif media_type == 'movie':
                    Media.objects.get_or_create(
                        title=result.get('title'),
                        media_type=media_type,
                        defaults={
                            'image_url': f"https://image.tmdb.org/t/p/w500{result.get('poster_path')}" if result.get('poster_path') else 'default-placeholder-image-url.jpg',
                            'rating': 0
                        }
                    )
                elif media_type == 'tv_show':
                    Media.objects.get_or_create(
                        title=result.get('name'),
                        media_type=media_type,
                        defaults={
                            'image_url': f"https://image.tmdb.org/t/p/w500{result.get('poster_path')}" if result.get('poster_path') else 'default-placeholder-image-url.jpg',
                            'rating': 0
                        }
                    )

            # Search again after populating the local database
            media_results = Media.objects.filter(title__icontains=query, media_type=media_type)

        except requests.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Serialize and return the media results
    media_data = MediaSerializer(media_results, many=True).data
    return Response(media_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_popular_games(request):
    api_key = 'ea05e5a7539a469f8bef014effda3748'
    url = f'https://api.rawg.io/api/games?key={api_key}&ordering=-rating'

    try:
        response = requests.get(url)
        response.raise_for_status()
        games = response.json().get('results', [])

        popular_games = [{'id': game.get('id'), 'title': game.get('name'), 'image_url': game.get('background_image'), 'rating': game.get('rating')} for game in games]

        return Response(popular_games, status=status.HTTP_200_OK)
    except requests.RequestException as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    return Response({'username': user.username, 'email': user.email})

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_user_media_list(request):
    user = request.user
    media_type = request.query_params.get('media_type', None)
    interactions = UserMediaInteraction.objects.filter(user=user, media__media_type=media_type) if media_type else UserMediaInteraction.objects.filter(user=user)
    serializer = UserMediaInteractionSerializer(interactions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_media_list_by_type(request, media_type):
    valid_media_types = ['anime', 'movie', 'video_game', 'tv_show']

    if media_type not in valid_media_types:
        return Response({"error": "Invalid media type."}, status=status.HTTP_400_BAD_REQUEST)

    media_list = Media.objects.filter(media_type=media_type)
    serializer = MediaSerializer(media_list, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_top_media_list_by_type(request, media_type):
    valid_media_types = ['anime', 'movie', 'video_game', 'tv_show']

    if media_type not in valid_media_types:
        return Response({"error": "Invalid media type."}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch media of the specified type
    media_list = Media.objects.filter(media_type=media_type)
    media_data = []

    for media in media_list:
        # Calculate the average rating for the media
        average_rating = UserMediaInteraction.objects.filter(media=media).aggregate(Avg('rating'))['rating__avg']

        # Only include media that has been rated (average_rating is not None)
        if average_rating is not None and average_rating > 0:
            serialized_media = MediaSerializer(media).data
            serialized_media['average_rating'] = round(average_rating, 2)
            media_data.append(serialized_media)

    # Sort media by average rating in descending order
    sorted_media = sorted(media_data, key=lambda x: x['average_rating'], reverse=True)
    return Response(sorted_media)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_media_list(request):
    media_list = Media.objects.all()
    serializer = MediaSerializer(media_list, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_media_detail(request, media_id):
    try:
        media = Media.objects.get(id=media_id)
        serializer = MediaSerializer(media)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Media.DoesNotExist:
        return Response({"error": "Media not found."}, status=status.HTTP_404_NOT_FOUND)
