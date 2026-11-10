import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./Mycontext.jsx";
import { v1 as uuidv1 } from "uuid";
import API_BASE_URL from "./api";
import Logo from "./Logo.jsx";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setcurrThreadId, setPreviousChats } = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread`, {
                credentials: "include"
            });
            const res = await response.json();
            const filterData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
            // console.log(filterData);
            setAllThreads(filterData);
            console.log(res)
        } catch (err) {
            console.log(err)
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId])

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setPreviousChats([]);
        setcurrThreadId(uuidv1());
    }

    const changeThread = async (newthreadId) => {
        setcurrThreadId(newthreadId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread/${newthreadId}`, {
                credentials: "include"
            })
            const res = await response.json();
            console.log(res);
            setPreviousChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err)
        }
    }

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {
                method: "DELETE",
                credentials: "include"
            });
            const res = await response.json()
            console.log(res);

            //update the sidebar
            setAllThreads(pre => pre.filter(thread => thread.threadId !== threadId));
            if (threadId === currThreadId) {
                createNewChat();
            }

        } catch (err) {
            console.log(err);
        }
    }

    return (
        <section className="sidebar">

            <div className="sidebar-top">
                <Logo size={34} withText />
            </div>
            <button onClick={createNewChat} className="newChatBtn">
                <i className="fa-solid fa-plus"></i> New chat
            </button>

            <ul className="history">
                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx} onClick={() => changeThread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "currentThread" : ""}
                        >{thread.title}
                            <i className="fa-solid fa-trash"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))
                }
            </ul>

            <div className="last">
                <p>G3-GPT · web search + memory</p>
            </div>
        </section>
    )
}

export default Sidebar; 