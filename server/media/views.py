from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Avg
from .models import UserMediaInteraction, Media
from .serializers import UserMediaInteractionSerializer, MediaSerializer
from django.contrib.auth.models import User  # Import the User model
import requests  # Import the requests library for making API calls


class UserMediaInteractionViewSet(viewsets.ModelViewSet):
    serializer_class = UserMediaInteractionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        return UserMediaInteraction.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user
        media = serializer.validated_data['media']

        # Check if an existing interaction exists for this user and media
        existing_interaction = UserMediaInteraction.objects.filter(user=user, media=media).first()

        if existing_interaction:
            # Update existing interaction's status and rating
            existing_interaction.status = serializer.validated_data['status']
            existing_interaction.rating = serializer.validated_data['rating']
            existing_interaction.save()
        else:
            # Create a new interaction if none exists
            serializer.save(user=user)

        # Update the media's average rating
        self.update_media_rating(media)

    def update_media_rating(self, media):
        interactions = UserMediaInteraction.objects.filter(media=media)
        total_ratings = sum(interaction.rating for interaction in interactions if interaction.rating is not None)
        rating_count = interactions.filter(rating__isnull=False).count()
        average_rating = total_ratings / rating_count if rating_count > 0 else 0
        media.rating = round(average_rating, 2)
        media.save()
# API View to fetch popular games using the RAWG.io API
@api_view(['GET'])
@permission_classes([AllowAny])
def get_popular_games(request):
    api_key = 'ea05e5a7539a469f8bef014effda3748'  # RAWG.io API key
    url = f'https://api.rawg.io/api/games?key={api_key}&ordering=-rating'

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an error for bad responses
        games = response.json().get('results', [])  # Extract the list of games from the response

        popular_games = []
        for game in games:
            popular_games.append({
                'id': game.get('id'),
                'title': game.get('name'),
                'image_url': game.get('background_image'),
                'rating': game.get('rating')
            })

        return Response(popular_games, status=status.HTTP_200_OK)

    except requests.RequestException as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API View to get logged-in user's info
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Requires user to be authenticated
def get_user_info(request):
    """
    Retrieve the logged-in user's information.
    """
    user = request.user
    user_data = {
        'username': user.username,
        'email': user.email,
    }
    return Response(user_data)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_media(request):
    query = request.query_params.get('q', '').lower()
    media_results = Media.objects.filter(title__icontains=query)
    
    # If no results found in the local database, fetch from the API
    if not media_results.exists():
        api_key = 'ea05e5a7539a469f8bef014effda3748'
        url = f'https://api.rawg.io/api/games?key={api_key}&search={query}'

        try:
            response = requests.get(url)
            response.raise_for_status()
            games = response.json().get('results', [])

            # Add the new games to the local database
            for game in games:
                media, created = Media.objects.get_or_create(
                    title=game.get('name'),
                    media_type='video_game',
                    defaults={
                        'image_url': game.get('background_image'),
                        'rating': 0  # Initial rating is set to 0 since no user has rated it yet
                    }
                )
                if created:
                    print(f"Added new game to database: {media.title}")

            # Query the updated database again to include the new games
            media_results = Media.objects.filter(title__icontains=query)

        except requests.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Serialize the media results to send back to the client
    media_data = MediaSerializer(media_results, many=True).data
    return Response(media_data, status=status.HTTP_200_OK)

# API View to retrieve the user's media list, optionally filtered by media type
@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_user_media_list(request):
    user = request.user
    media_type = request.query_params.get('media_type', None)

    if media_type:
        interactions = UserMediaInteraction.objects.filter(user=user, media__media_type=media_type)
    else:
        interactions = UserMediaInteraction.objects.filter(user=user)

    serializer = UserMediaInteractionSerializer(interactions, many=True)
    return Response(serializer.data)

# API View to get media list filtered by media type
@api_view(['GET'])
@permission_classes([AllowAny])
def get_media_list_by_type(request, media_type):
    valid_media_types = ['anime', 'movie', 'video_game', 'tv_show']

    if media_type not in valid_media_types:
        return Response({"error": "Invalid media type."}, status=status.HTTP_400_BAD_REQUEST)

    media_list = Media.objects.filter(media_type=media_type)
    serializer = MediaSerializer(media_list, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def calculate_average_rating(media):
    """
    Calculate the average rating for a given media item.
    """
    average = UserMediaInteraction.objects.filter(media=media).aggregate(Avg('rating'))['rating__avg']
    return round(average, 2) if average else 0

# API View to get the top media list by media type
@api_view(['GET'])
@permission_classes([AllowAny])
def get_top_media_list_by_type(request, media_type):
    valid_media_types = ['anime', 'movie', 'video_game', 'tv_show']

    if media_type not in valid_media_types:
        return Response({"error": "Invalid media type."}, status=status.HTTP_400_BAD_REQUEST)

    media_list = Media.objects.filter(media_type=media_type)
    media_data = []

    for media in media_list:
        average_rating = calculate_average_rating(media)
        serialized_media = MediaSerializer(media).data
        serialized_media['average_rating'] = average_rating
        media_data.append(serialized_media)

    sorted_media = sorted(media_data, key=lambda x: x['average_rating'], reverse=True)
    return Response(sorted_media)

# API View to get all media in the database
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
