# TriviaAIAdventure
AI-powered multiplayer trivia game using the Open AI GPT-4 engine

## Features
- **Real-Time Multiplayer:** Compete with friends and players worldwide.
- **Dynamic Question Generation:** AI generates a wide variety of questions for endless gameplay.
- **Multiple Game Modes:** Including Classic Trivia, Trivia Board, and Randomized Trivia.
- **User Authentication:** Secure user accounts and leaderboard tracking.
- **In-Game Chat and Friend System:** Social features to enhance gameplay.

## Technology Stack
- **Frontend:** HTML5, CSS3, Bootstrap, React, jQuery
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI Integration:** OpenAI GPT-4 API
- **Real-Time Communication:** Socket.io
- **Deployment:** AWS

## Getting Started
### Prerequisites
- Node.js
- npm
- MongoDB
- OpenAI API Key
- Render for deployment (other options are available but render is free and can run both backend and frontend)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/omaralkadry/TriviaAIAdventure.git
   ```
2. Navigate to the project directory and install dependencies for both frontend and backend:
   ```
   cd /frontend
   npm install
   cd ..
   cd /backend
   npm install
   ```

### Running the Project
1. Navigate to the project directory and add .env files to frontend and backend:
   ```
   cd /backend
   ```
   add .env file here with Database_Url and OPENAI_API_KEY
   ```
   cd ..
   cd /frontend
   ```
   add .env file here with VITE_BASE_URL which the url for your backend and will change depending on how you deploy

### Deployment on Render
1. Deploy the frontend as a Web Service
2. Root Directory = ./frontend
3. Build Command = npm install
4. Start Command = npm run dev
5. You will need to navigate to the Environment settings and add the backend Web Service url as VITE_BASE_URL
6. Deploy the backend as a Web Service
7. Root Directory = ./backend
8. Build Command = npm install
9. Start Command = node app.js
10. You will need to navigate to the Environment settings and add all the needed .env file variables



## License
This project is not licensed for public use. No part of this project may be used, copied, modified, or distributed without explicit permission from the author.

## Disclaimer
This is a private senior project for a group of students at a university, made public only for the class. Feel free to look at the project, but do not copy or fork it.

## Contact
Feel free to contact at omar.alkadry@ufl.edu regarding any inquiries
