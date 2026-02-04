import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./Mycontext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setcurrThreadId, setPreviousChats } = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/thread");
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
            const response = await fetch(`http://localhost:8000/api/thread/${newthreadId}`)
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
            const response = await fetch(`http://localhost:8000/api/thread/${threadId}`, { method: "DELETE" });
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

            <button onClick={createNewChat} className="sidebar-header-btn">
                <i className="fa-solid fa-g"></i>{/* <span className="logo3">3</span> */}
                {/*  <img src='src/assets/logo.png' className="logo" alt='g3-gptlogo'></img> */}
                <i className="fa-solid fa-pen-to-square"></i>
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
                <p>G3-GPT</p>
            </div>
        </section>
    )
}

export default Sidebar; 