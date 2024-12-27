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
    get_media_detail,
    train_recommendation_models,  # Import the new endpoint
    get_recommendations,  # Import the recommendations endpoint
    get_user_media_interaction
)

router = DefaultRouter()
router.register(r'interactions', UserMediaInteractionViewSet, basename='usermediainteraction')

urlpatterns = [
    path('list/', get_media_list, name='get_media_list'),
    path('list/<str:media_type>/', get_media_list_by_type, name='get_media_list_by_type'),
    path('top-media/<str:media_type>/', get_top_media_list_by_type, name='get_top_media_list_by_type'),
    path('search/', search_media, name='search_media'),
    path('user-media-list/', get_user_media_list, name='get_user_media_list'),
    path('user-info/', get_user_info, name='get_user_info'),
    path('', include(router.urls)),
    path('popular-games/', get_popular_games, name='get_popular_games'),
    path('detail/<int:media_id>/', get_media_detail, name='get_media_detail'),
    path('train-models/', train_recommendation_models, name='train_recommendation_models'),  # Add this line
    path('recommendations/', get_recommendations, name='get_recommendations'),  # Add this line for recommendations
    path('user-media-interaction/<int:media_id>/', get_user_media_interaction, name='get_user_media_interaction'),

]
