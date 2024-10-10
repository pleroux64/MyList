from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/media/', include('media.urls')),
    path('api/auth/', include('users.urls')),  # Include the users app URLs here
]
