import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './chatWindow.jsx';
import { MyContext } from './Mycontext.jsx';

import { useState } from "react";
import { v1 as uuidv1} from "uuid";

function App() {
   const [prompt, setPrompt] = useState("");
   const [reply, setReply] = useState("");
   const [currThreadId, setcurrThreadId] = useState(uuidv1());
    
   const [preChats, setPreviousChats]  = useState([]);
   const [newChat, setNewChat] = useState(true);

   const providedValue = {
      prompt, setPrompt,
      reply, setReply,
      currThreadId, setcurrThreadId,
      newChat, setNewChat,
      preChats, setPreviousChats
   };

  return (

    <div className="main">
      <MyContext.Provider value={providedValue}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>

  )
}

export default App
