# media/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserMediaInteractionViewSet,
    get_media_list,
    search_media,
    get_user_media_list,
    get_media_list_by_type  # Import the new view for media type filtering
)

# Create a router and register the UserMediaInteractionViewSet
router = DefaultRouter()
router.register(r'interactions', UserMediaInteractionViewSet, basename='usermediainteraction')

# URL patterns for the media app
urlpatterns = [
    path('list/', get_media_list, name='get_media_list'),  # Media list endpoint
    path('list/<str:media_type>/', get_media_list_by_type, name='get_media_list_by_type'),  # Media list by type endpoint
    path('search/', search_media, name='search_media'),  # Search media endpoint
    path('user-media-list/', get_user_media_list, name='get_user_media_list'),  # User-specific media list
    path('', include(router.urls)),  # Include router-generated URLs for interactions
]
