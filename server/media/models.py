from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User

class Media(models.Model):
    MEDIA_TYPES = [
        ('movie', 'Movie'),
        ('anime', 'Anime'),
        ('tv_show', 'TV Show'),
        ('video_game', 'Video Game'),
    ]

    title = models.CharField(max_length=200)
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)
    rating = models.FloatField(default=0.0)

    def __str__(self):
        return f'{self.title} ({self.media_type})'

class UserMediaInteraction(models.Model):
    STATUS_CHOICES = {
        'movie': [('watched', 'Watched'), ('watching', 'Watching'), ('plan_to_watch', 'Plan to Watch')],
        'anime': [('watched', 'Watched'), ('watching', 'Watching'), ('plan_to_watch', 'Plan to Watch')],
        'tv_show': [('watched', 'Watched'), ('watching', 'Watching'), ('plan_to_watch', 'Plan to Watch')],
        'video_game': [('played', 'Played'), ('playing', 'Playing'), ('plan_to_play', 'Plan to Play')],
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    media = models.ForeignKey(Media, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[(choice[0], choice[1]) for choices in STATUS_CHOICES.values() for choice in choices])
    rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(10)])

    def save(self, *args, **kwargs):
        # Validate that the status is appropriate for the media type
        media_type = self.media.media_type
        valid_statuses = [choice[0] for choice in self.STATUS_CHOICES.get(media_type, [])]

        if self.status not in valid_statuses:
            raise ValueError(f"Invalid status '{self.status}' for media type '{media_type}'")

        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user.username} - {self.media.title} ({self.status})'