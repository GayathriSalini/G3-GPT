import "./chatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./Mycontext.jsx";
import { useContext, useState, useEffect } from "react";

import { CircleLoader, SyncLoader } from "react-spinners";

function ChatWindow() {

    const { prompt, setPrompt, reply, setReply, currThreadId, preChats, setPreviousChats, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    
    const [isOpen, setisOpen] = useState(false);

    const getReply = async () => {
        setLoading(true);
        setNewChat(false);
        console.log("message", prompt, "threadId", currThreadId)
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };
        try {
            const response = await fetch("http://localhost:8000/api/chat", options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    }

    //append new chats
    useEffect(() => {
        if (prompt && reply) {
           setPreviousChats(preChats => (
             [...preChats, {
                role:"user",
                content: prompt 
             },{
                role:"assistant",
                content: reply
             }]
           ))
          
        }
        setPrompt("");
    }, [reply])


    const profileSettings = () => {
        setisOpen(!isOpen);
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>G3-GPT &nbsp; {/* <i className="fa-solid fa-arrow-down"></i> */}</span>
                <div className="userIcondiv" onClick={profileSettings}>
                    <span className="userIcon">  <i className="fa-regular fa-user"></i> </span>
                </div>
            </div>
            {
                isOpen && 
                <div className="settingOptions">
                     <div className="settingItem"><i className="fa-solid fa-arrow-up-right-from-square"></i>Upgrade Plan</div>
                     <div className="settingItem"><i className="fa-solid fa-gear"></i>Settings</div>
                     <div className="settingItem"><i className="fa-solid fa-arrow-right-from-bracket"></i>Log Out</div>
                </div>
            }
            <Chat></Chat>
            <CircleLoader color="#ffff" loading={loading} ></CircleLoader>
            <div className="inputArea">
                <div className="userInput">
                    <input placeholder="ask anything..."
                        value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key == 'Enter' ? getReply() : ''}>
                    </input>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    G3-GPT can make mistakes. Please verify critical information from reliable sources.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;