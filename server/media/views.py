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
import pandas as pd
from django.shortcuts import render
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
import joblib
import os


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

    if not media_results.exists():
        if media_type == 'video_game':
            # Fetch video games from RAWG API
            api_key = os.getenv('RAWG_API_KEY', '')
            url = f'https://api.rawg.io/api/games?key={api_key}&search={query}'
        elif media_type == 'anime':
            # Fetch anime from Jikan API (Jikan does not require an API key)
            url = f'https://api.jikan.moe/v4/anime?q={query}'
        elif media_type == 'movie':
            # Fetch movies from TMDB API
            api_key = os.getenv('TMDB_API_KEY', '')
            url = f'https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={query}'
        elif media_type == 'tv_show':
            # Fetch TV shows from TMDB API
            api_key = os.getenv('TMDB_API_KEY', '')
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

            # Save the fetched media to the local database with descriptions
            for result in results:
                if media_type == 'video_game':
                    Media.objects.get_or_create(
                        title=result.get('name'),
                        media_type=media_type,
                        defaults={
                            'image_url': result.get('background_image', 'default-placeholder-image-url.jpg'),
                            'rating': 0,
                            'description': result.get('description_raw', '')  # Fetch description if available
                        }
                    )
                elif media_type == 'anime':
                    Media.objects.get_or_create(
                        title=result.get('title'),
                        media_type=media_type,
                        defaults={
                            'image_url': result.get('images', {}).get('jpg', {}).get('image_url', 'default-placeholder-image-url.jpg'),
                            'rating': 0,
                            'description': result.get('synopsis', '')  # Fetch synopsis as description
                        }
                    )
                elif media_type == 'movie':
                    Media.objects.get_or_create(
                        title=result.get('title'),
                        media_type=media_type,
                        defaults={
                            'image_url': f"https://image.tmdb.org/t/p/w500{result.get('poster_path')}" if result.get('poster_path') else 'default-placeholder-image-url.jpg',
                            'rating': 0,
                            'description': result.get('overview', '')  # Fetch overview as description
                        }
                    )
                elif media_type == 'tv_show':
                    Media.objects.get_or_create(
                        title=result.get('name'),
                        media_type=media_type,
                        defaults={
                            'image_url': f"https://image.tmdb.org/t/p/w500{result.get('poster_path')}" if result.get('poster_path') else 'default-placeholder-image-url.jpg',
                            'rating': 0,
                            'description': result.get('overview', '')  # Fetch overview as description
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
    
@api_view(['GET'])
@permission_classes([AllowAny])
def train_recommendation_models(request):
    media_types = ['anime', 'movie', 'tv_show', 'video_game']
    models = {}

    # Create the models directory if it doesn't exist
    models_dir = os.getenv('MODELS_DIR', 'models')  # Default to 'models' if not set
    os.makedirs(models_dir, exist_ok=True)

    for media_type in media_types:
        # Step 1: Extract Data for the current media type
        interactions = UserMediaInteraction.objects.filter(media__media_type=media_type).values('user_id', 'media_id', 'rating')
        df = pd.DataFrame(list(interactions))

        # Step 2: Filter out rows with None ratings
        df = df[df['rating'].notnull()]  # Remove rows where rating is None
        if df.empty:  # Check if there is no data left after filtering
            continue  # Skip training for this media type if no valid ratings

        # Step 3: Format Data
        df.columns = ['user', 'item', 'rating']  # Rename columns for Surprise

        # Step 4: Train PMF Model
        reader = Reader(rating_scale=(1, 10))  # Adjust based on your rating scale
        data = Dataset.load_from_df(df[['user', 'item', 'rating']], reader)
        trainset, testset = train_test_split(data, test_size=0.2)

        model = SVD()  # Using SVD for PMF
        model.fit(trainset)

        # Save the model for the specific media type
        joblib.dump(model, f'{models_dir}/{media_type}_model.pkl')  # Save model to disk

    # Train a general model on all media types
    interactions_all = UserMediaInteraction.objects.all().values('user_id', 'media_id', 'rating')
    df_all = pd.DataFrame(list(interactions_all))

    # Filter out rows with None ratings for the general model as well
    df_all = df_all[df_all['rating'].notnull()]
    if df_all.empty:  # Check if there is no data left after filtering
        return Response({"message": "No valid ratings available to train general model."}, status=status.HTTP_400_BAD_REQUEST)

    df_all.columns = ['user', 'item', 'rating']

    reader = Reader(rating_scale=(1, 10))
    data_all = Dataset.load_from_df(df_all[['user', 'item', 'rating']], reader)
    trainset_all, testset_all = train_test_split(data_all, test_size=0.2)

    general_model = SVD()  # Using SVD for PMF
    general_model.fit(trainset_all)

    # Save the general model as well
    joblib.dump(general_model, f'{models_dir}/general_model.pkl')  # Save general model to disk

    return Response({"message": "All models trained and saved successfully."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    user_id = request.user.id  # Get the logged-in user's ID
    media_type = request.query_params.get('media_type', 'all')  # Specify media type in the query parameter
    use_general_model = request.query_params.get('use_general_model', 'false').lower() == 'true'  # Whether to use the general model
    count = int(request.query_params.get('count', 10))  # Get the desired count, default to 10

    # Fetch MODELS_DIR from environment variables
    models_dir = os.getenv('MODELS_DIR', 'models')  # Default to 'models'

    # Load the appropriate model based on the requested media type and the user's choice
    if media_type in ['anime', 'movie', 'tv_show', 'video_game']:
        model_path = os.path.join(models_dir, f'{media_type}_model.pkl')
        if use_general_model:
            model_path = os.path.join(models_dir, 'general_model.pkl')
    elif media_type == 'all':
        model_path = os.path.join(models_dir, 'general_model.pkl')  # General model
    else:
        return Response({"error": "Invalid media type."}, status=status.HTTP_400_BAD_REQUEST)

    # Load the model
    try:
        model = joblib.load(model_path)
    except FileNotFoundError:
        return Response({"error": f"Model file not found for {media_type}."}, status=status.HTTP_404_NOT_FOUND)

    # Create a list for predictions
    predictions = []
    all_media_ids = []

    if media_type == 'all':
        all_media = Media.objects.values('id')
    else:
        all_media = Media.objects.filter(media_type=media_type).values('id')

    # Create a list of media IDs to predict
    for media in all_media:
        all_media_ids.append(media['id'])

    # Make predictions
    for media_id in all_media_ids:
        pred = model.predict(user_id, media_id)
        predictions.append((media_id, pred.est))

    # Sort predictions by estimated rating
    sorted_predictions = sorted(predictions, key=lambda x: x[1], reverse=True)

    # Get top recommendations based on the specified count
    top_predictions = sorted_predictions[:count]

    # Fetch media details for the top predictions
    top_recommendations = []
    for media_id, estimated_rating in top_predictions:
        media_details = Media.objects.get(id=media_id)
        top_recommendations.append({
            'id': media_id,  # Include the media ID in the response
            'title': media_details.title,
            'image_url': media_details.image_url,
            'estimated_rating': media_details.rating
        })

    return Response(top_recommendations, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Uncomment this if you want to enforce authentication
def get_user_media_interaction(request, media_id):
    """
    Get the user's interaction (status, rating) with a specific media item.
    """
    user = request.user
    try:
        # Query for the interaction by user and media_id
        interaction = UserMediaInteraction.objects.get(user=user, media__id=media_id)
        # Serialize the interaction data
        serializer = UserMediaInteractionSerializer(interaction)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserMediaInteraction.DoesNotExist:
        # Return an error message if no interaction is found
        return Response({"detail": "No interaction found for this media."}, status=status.HTTP_404_NOT_FOUND)
