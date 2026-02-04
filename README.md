# G3-GPT

G3-GPT is a full-stack AI chat application that provides a seamless interface for interacting with GPT models. It features a responsive React-based frontend with markdown support and syntax highlighting, backed by a robust Express/Node.js server and MongoDB for data persistence.

## 🚀 Features

- **AI Chat Interface**: Real-time interaction with GPT-4o-mini.
- **Markdown & Code Highlighting**: Full support for markdown rendering with syntax highlighting for code blocks.
- **Thread Management**: Organized chat threads for better conversation tracking.
- **Responsive Design**: Optimized for various screen sizes.
- **Persistent Storage**: MongoDB integration for saving chat history.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: CSS
- **Key Libraries**: 
  - `react-markdown` & `rehype-highlight` (Markdown support)
  - `highlight.js` (Syntax highlighting)
  - `react-spinners` (Loading states)
  - `uuid` (Unique identifiers)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (Mongoose)
- **AI Integration**: OpenAI SDK
- **Development**: Nodemon (Auto-restart)

## 📋 Prerequisites

- **Node.js**: (v18 or higher recommended)
- **MongoDB**: A running instance (local or Cloud Atlas)
- **API Key**: An OpenAI API key (or compatible OpenRouter key)

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

## 📁 Project Structure

```
G3-GPT/
├── backend/            # Express server & API routes
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── utils/          # Helper functions
│   └── server.js       # Entry point
├── frontend/           # React application
│   ├── src/            # Components & App logic
│   └── public/         # Static assets
└── README.md           # Project documentation
```
