from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import UserMediaInteraction, Media
from .serializers import UserMediaInteractionSerializer, MediaSerializer
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

class UserMediaInteractionViewSet(viewsets.ModelViewSet):
    queryset = UserMediaInteraction.objects.all()
    serializer_class = UserMediaInteractionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Only show the interactions for the current user
        user = self.request.user
        return UserMediaInteraction.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user
        media = serializer.validated_data['media']

        # Check if an existing interaction exists for this user and media
        existing_interaction = UserMediaInteraction.objects.filter(user=user, media=media).first()

        if existing_interaction:
            # If the interaction already exists, update its status and rating
            existing_interaction.status = serializer.validated_data['status']
            existing_interaction.rating = serializer.validated_data['rating']
            existing_interaction.save()
        else:
            # If no interaction exists, create a new one
            serializer.save(user=user)

# API View for media search (no authentication required)
@api_view(['GET'])
@permission_classes([AllowAny])  # Allow anyone to access the search endpoint
def search_media(request):
    query = request.query_params.get('q', '')
    media_results = Media.objects.filter(title__icontains=query)
    serializer = MediaSerializer(media_results, many=True)
    return Response(serializer.data)

# API View for retrieving the user's media list (requires authentication)
@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])  # Authentication required for retrieving user-specific lists
def get_user_media_list(request):
    user = request.user
    interactions = UserMediaInteraction.objects.filter(user=user)
    serializer = UserMediaInteractionSerializer(interactions, many=True)
    return Response(serializer.data)

# API View to get media list filtered by media type
@api_view(['GET'])
@permission_classes([AllowAny])  # Allow anyone to access the list by type
def get_media_list_by_type(request, media_type):
    valid_media_types = ['anime', 'movie', 'videogame', 'tv_show']
    
    if media_type not in valid_media_types:
        return Response({"error": "Invalid media type."}, status=status.HTTP_400_BAD_REQUEST)
    
    media_list = Media.objects.filter(media_type=media_type)
    serializer = MediaSerializer(media_list, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Existing media list view (no authentication required)
@api_view(['GET'])
@permission_classes([AllowAny])  # Allow anyone to access the media list
def get_media_list(request):
    media_list = Media.objects.all()
    serializer = MediaSerializer(media_list, many=True)
    return Response(serializer.data)
