import "./chatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./Mycontext.jsx";
import { useContext, useState, useEffect } from "react";

import { CircleLoader, SyncLoader } from "react-spinners";

function ChatWindow() {

    const { prompt, setPrompt, reply, setReply, currThreadId, preChats, setPreviousChats, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);

    const getReply = async () => {
        setLoading(true);
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

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>G3-GPT &nbsp; {/* <i className="fa-solid fa-arrow-down"></i> */}</span>
                <div className="userIcondiv">
                    <span className="userIcon">  <i className="fa-regular fa-user"></i> </span>
                </div>
            </div>
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