from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserMediaInteractionViewSet,
    get_media_list,
    search_media,
    get_user_media_list,
    get_media_list_by_type,
    get_top_media_list_by_type,
    get_user_info  # Import the new view for user info
)

# Create a router and register the UserMediaInteractionViewSet
router = DefaultRouter()
router.register(r'interactions', UserMediaInteractionViewSet, basename='usermediainteraction')

# URL patterns for the media app
urlpatterns = [
    path('list/', get_media_list, name='get_media_list'),  # Media list endpoint
    path('list/<str:media_type>/', get_media_list_by_type, name='get_media_list_by_type'),  # Media list by type endpoint
    path('top-media/<str:media_type>/', get_top_media_list_by_type, name='get_top_media_list_by_type'),  # Top media list by type endpoint
    path('search/', search_media, name='search_media'),  # Search media endpoint
    path('user-media-list/', get_user_media_list, name='get_user_media_list'),  # User-specific media list
    path('user-info/', get_user_info, name='get_user_info'),  # User info endpoint
    path('', include(router.urls)),  # Include router-generated URLs for interactions
]
