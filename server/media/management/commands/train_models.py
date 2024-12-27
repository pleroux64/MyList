import requests
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Call the training endpoint to train recommendation models'

    def handle(self, *args, **kwargs):
        url = 'http://localhost:8000/api/media/train-models/'  # Adjust to your API endpoint

        try:
            response = requests.get(url)  # Call the training endpoint
            response.raise_for_status()  # Raise an error for bad responses

            self.stdout.write(self.style.SUCCESS(response.json().get('message', 'Models trained successfully.')))
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Error calling training endpoint: {e}'))
