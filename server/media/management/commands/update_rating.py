from django.core.management.base import BaseCommand
from media.models import Media, UserMediaInteraction

class Command(BaseCommand):
    help = 'Update average ratings for all media items'

    def handle(self, *args, **kwargs):
        media_items = Media.objects.all()
        updated_count = 0

        for media_item in media_items:
            self.update_average_rating(media_item)  # Call the defined method
            updated_count += 1
            self.stdout.write(self.style.SUCCESS(f'Updated rating for {media_item.title}: {media_item.rating}'))

        self.stdout.write(self.style.SUCCESS(f'Updated ratings for {updated_count} media items.'))

    def update_average_rating(self, media_item):
        interactions = UserMediaInteraction.objects.filter(media=media_item)
        total_ratings = sum(interaction.rating for interaction in interactions if interaction.rating is not None)
        rating_count = interactions.filter(rating__isnull=False).count()
        average_rating = total_ratings / rating_count if rating_count > 0 else 0
        media_item.rating = round(average_rating, 2)
        media_item.save()
