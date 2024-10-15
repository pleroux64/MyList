from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserMediaInteractionViewSet,
    get_media_list,
    search_media,
    get_user_media_list,
    get_media_list_by_type,
    get_top_media_list_by_type,
    get_user_info,
    get_popular_games,
    get_media_detail  # Include the view for media detail
)

# Create a router and register the UserMediaInteractionViewSet
router = DefaultRouter()
router.register(r'interactions', UserMediaInteractionViewSet, basename='usermediainteraction')

# URL patterns for the media app
urlpatterns = [
    path('list/', get_media_list, name='get_media_list'),
    path('list/<str:media_type>/', get_media_list_by_type, name='get_media_list_by_type'),
    path('top-media/<str:media_type>/', get_top_media_list_by_type, name='get_top_media_list_by_type'),
    path('search/', search_media, name='search_media'),
    path('user-media-list/', get_user_media_list, name='get_user_media_list'),
    path('user-info/', get_user_info, name='get_user_info'),
    path('', include(router.urls)),
    path('popular-games/', get_popular_games, name='get_popular_games'),
    path('detail/<int:media_id>/', get_media_detail, name='get_media_detail'),  # Add this line for media detail endpoint
]
