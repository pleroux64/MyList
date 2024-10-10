from django.contrib import admin
from .models import Media
from .models import Media, UserMediaInteraction

# Register your models here.
admin.site.register(Media)
admin.site.register(UserMediaInteraction)


