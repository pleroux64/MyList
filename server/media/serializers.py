from rest_framework import serializers
from .models import UserMediaInteraction, Media

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['id', 'title', 'media_type', 'rating', 'image_url']  # Include the image_url field

class UserMediaInteractionSerializer(serializers.ModelSerializer):
    media = serializers.PrimaryKeyRelatedField(queryset=Media.objects.all())

    class Meta:
        model = UserMediaInteraction
        fields = ['id', 'media', 'status', 'rating']

    def validate_rating(self, value):
        """
        Check that the rating is at least 1.
        """
        if value is not None and value < 1:
            raise serializers.ValidationError("Rating must be at least 1.")
        return value

    def to_representation(self, instance):
        if isinstance(instance, UserMediaInteraction):
            # Only access the media attribute if instance is a UserMediaInteraction model instance
            representation = super().to_representation(instance)
            representation['media'] = MediaSerializer(instance.media).data  # Include the full media details
            return representation
        else:
            return super().to_representation(instance)
