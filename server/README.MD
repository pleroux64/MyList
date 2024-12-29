# MyList Backend (Server)

## Overview
The backend is built with Django and Django REST Framework (DRF). It provides:
- APIs for user authentication and media interactions.
- Recommendations using collaborative filtering (SVD).
- Integration with external APIs (RAWG, TMDB, Jikan) for media data.

## Local Setup
To run the backend locally:

### Prerequisites
- Python 3.8+
- PostgreSQL
- pip

### Steps
1. Navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the database:
   - Ensure PostgreSQL is running.
   - Create a database (e.g., `rankdb`).
   - Update the database settings in `rank/settings.py`.
   - Run migrations:
     ```bash
     python manage.py migrate
     ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Features
- Secure authentication with JWT tokens.
- API endpoints for:
  - Media search
  - User interactions
  - Recommendations
- Collaborative filtering with saved SVD models.

## Technologies Used
- Django
- Django REST Framework
- PostgreSQL
- Surprise Library (Collaborative Filtering)

