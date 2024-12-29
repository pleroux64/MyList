# MyList Project

## Overview
MyList is a media recommendation and tracking platform that allows users to:
- Search for and track movies, TV shows, anime, and video games.
- Rate and interact with media to receive personalized recommendations.
- Explore top-rated media lists based on global ratings.

## Project Structure
- **client/**: The React frontend for user interaction.
- **server/**: The Django backend providing APIs for media recommendations, search, and user management.

## Live Demo
Access the live application here: [MyList Live Link](https://mylist-gray.vercel.app/)

## Local Setup
If you'd like to run the project locally, follow these steps:

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Git

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rank.git
   ```
2. Navigate to the project directory:
   ```bash
   cd rank
   ```
3. **Backend Setup (Server)**: For detailed backend setup instructions, check the `server/README.md`.
4. **Frontend Setup (Client)**: For detailed frontend setup instructions, check the `client/README.md`.

## Features
- **Personalized Recommendations**: Built using collaborative filtering with SVD.
- **Media Search**: Integrates RAWG, TMDB, and Jikan APIs for comprehensive search.
- **Authentication**: Secure user authentication and interaction tracking.

## License
MIT
