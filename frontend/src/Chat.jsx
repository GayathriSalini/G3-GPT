import "./chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./Mycontext.jsx";

//reply formating
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const { newChat, preChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState("");


    useEffect(() => {
        if (!reply) return;

        const words = reply.split(" ");
        let currentIdx = 0;
        setLatestReply(""); // Reset for new reply

        const interval = setInterval(() => {
            setLatestReply((prev) => {
                const next = words.slice(0, currentIdx + 1).join(" ");
                currentIdx++;
                if (currentIdx >= words.length) {
                    clearInterval(interval);
                }
                return next;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [reply]);

    return (
        <>
            {newChat && <h1>Start New Converstion</h1>}
            <div className="chats">
                {
                    preChats?.map((chat, idx) => {
                        const isLastAssistantMessage = idx === preChats.length - 1 && chat.role === "assistant";
                        const contentToDisplay = (isLastAssistantMessage && latestReply) ? latestReply : chat.content;

                        return (
                            <div className={chat.role === "user" ? "userDiv" : "g3gptDiv"} key={idx}>
                                {
                                    chat.role === "user" ?
                                        <p className="userprompt">{chat.content}</p> :
                                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                            {contentToDisplay}
                                        </ReactMarkdown>
                                }
                            </div>
                        );
                    })
                }


                {/* <div className="userDiv">
                    <p className="userprompt">User Prompt</p>
                </div>
                <div className="g3gptDiv">
                    <p className="g3gptReply">G3-GPT generated reply</p>
                </div> */}
            </div>
        </>
    )
}


export default Chat;