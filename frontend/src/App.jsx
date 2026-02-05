import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { MyContext } from './Mycontext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [currThreadId, setcurrThreadId] = useState(uuidv1());

  const [preChats, setPreviousChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  const providedValue = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setcurrThreadId,
    newChat, setNewChat,
    preChats, setPreviousChats,
    allThreads, setAllThreads
  };

  return (
    <div className="App">
      <MyContext.Provider value={providedValue}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <ToastContainer position="bottom-right" theme="dark" />
      </MyContext.Provider>
    </div>
  );
}

export default App;
