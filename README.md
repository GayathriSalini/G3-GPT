# G3-GPT

G3-GPT is a full-stack AI chat application that provides a seamless interface for interacting with GPT models. It features a secure JWT-based authentication system, user-specific chat history, and a modern, responsive React-based frontend.

## 🚀 Features

- **Secure Authentication**: JWT-based Signup and Login system with protected routes.
- **User-Specific History**: Private chat history for every user; your data is isolated and secure.
- **AI Chat Interface**: Real-time interaction with GPT-4o-mini with typing animations.
- **Markdown & Code Highlighting**: Full support for markdown rendering with syntax highlighting.

- **Web-search agent**: one tool (`web_search`); the model decides when to search, cites sources `[1]`, and shows source chips.
- **Streaming**: real token streaming (SSE) with live "Searching the web…" status.
- **Memory**: full thread history with timestamps is sent every turn (so "what did I ask / when" works), plus a digest of your recent other chats.

Optional backend `.env`: `TAVILY_API_KEY` (better search; falls back to keyless DuckDuckGo), `MODEL` (default `gpt-4o-mini`).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **State Management**: React Context API
- **Routing**: React Router DOM (v7+)
- **Authentication**: `react-cookie` for session management
- **Styling**: Vanilla CSS 
- **Key Libraries**: `react-markdown`, `rehype-highlight`, `react-spinners`, `uuid`

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (Mongoose)
- **Security**: `bcryptjs` for hashing, `jsonwebtoken` for auth tokens
- **AI Integration**: OpenAI SDK
- **Middleware**: `cookie-parser`, `cors`

## 📋 Prerequisites

- **Node.js**: (v18 or higher recommended)
- **MongoDB**: A running instance (local or Cloud Atlas)
- **API Key**: An OpenAI API key

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/GayathriSalini/G3-GPT.git
cd G3-GPT
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
TOKEN_KEY=your_random_secret_string_for_jwt
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🏃 Running the Application

### Start the Backend
```bash
cd backend
npm start
```
The server will run on `http://localhost:8000`.

### Start the Frontend
```bash
cd frontend
npm run dev
```
The application will be accessible at `http://localhost:5173/`. 

> [!NOTE]
> The default landing page is **Login**. You must sign up first to access the chat interface.

## 📁 Project Structure

```
G3-GPT/
├── backend/            # Express server & API routes
│   ├── middleware/     # Auth & validation logic
│   ├── models/         # User & Thread schemas
│   ├── routes/         # API endpoints
│   └── server.js       # Entry point
├── frontend/           # React application
│   ├── src/
│   │   ├── pages/      # Home, Login, Signup views
│   │   └── ...         # Core components (Sidebar, Chat, etc.) and App logic
│   └── public/         # Static assets
└── README.md           # Project documentation
```
