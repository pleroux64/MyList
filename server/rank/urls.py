from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

def root_view(request):
    return JsonResponse({"message": "Backend is running"})

urlpatterns = [
    path('', root_view),
    path('admin/', admin.site.urls),
    path('api/media/', include('media.urls')),
    path('api/auth/', include('users.urls')),  # Include the users app URLs here
]
