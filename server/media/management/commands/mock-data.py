from django.core.management.base import BaseCommand
from faker import Faker
import random
from media.models import UserMediaInteraction, Media
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Generate mock data for users and their media interactions'

    def handle(self, *args, **kwargs):
        faker = Faker()
        user_count = 10  # Number of random users to create
        ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]  # Possible ratings

        # Define valid statuses for each media type
        valid_statuses = {
            'anime': ['watched', 'watching', 'plan_to_watch'],
            'movie': ['watched', 'watching', 'plan_to_watch'],
            'tv_show': ['watched', 'watching', 'plan_to_watch'],
            'video_game': ['played', 'playing', 'plan_to_play']
        }

        # Create a specific user (your account)
        my_user = User.objects.get(username='test')  # Update with your username
        for _ in range(random.randint(50, 100)):  # User interacts with 50-100 media items
            media_item = Media.objects.order_by('?').first()  # Get a random media item
            media_type = media_item.media_type  # Get the media type of the selected item
            status = random.choice(valid_statuses[media_type])  # Get a valid status for the media type

            # Create a user media interaction
            interaction = UserMediaInteraction.objects.create(
                user=my_user,
                media=media_item,
                rating=random.choice(ratings),  # Random rating from the list
                status=status
            )
            print(f'Created interaction for user: {my_user.username}, media: {media_item.title}, status: {status}')

            # Update the average rating for the media item
            self.update_average_rating(media_item)

        # Create random users
        for _ in range(user_count):
            user = User.objects.create_user(
                username=faker.user_name(),
                password='password123',
                email=faker.email()
            )
            print(f'Created user: {user.username}')

            # Create interactions for this random user
            for _ in range(random.randint(5, 10)):  # Each user interacts with 5-10 media items
                media_item = Media.objects.order_by('?').first()  # Get a random media item
                media_type = media_item.media_type  # Get the media type of the selected item
                status = random.choice(valid_statuses[media_type])  # Get a valid status for the media type

                interaction = UserMediaInteraction.objects.create(
                    user=user,
                    media=media_item,
                    rating=random.choice(ratings),  # Random rating from the list
                    status=status
                )
                print(f'Created interaction for user: {user.username}, media: {media_item.title}, status: {status}')

                # Update the average rating for the media item
                self.update_average_rating(media_item)

        self.stdout.write(self.style.SUCCESS('Mock data generated successfully.'))

    def update_average_rating(self, media_item):
        interactions = UserMediaInteraction.objects.filter(media=media_item)
        total_ratings = sum(interaction.rating for interaction in interactions if interaction.rating is not None)
        rating_count = interactions.filter(rating__isnull=False).count()
        average_rating = total_ratings / rating_count if rating_count > 0 else 0
        media_item.rating = round(average_rating, 2)
        media_item.save()
