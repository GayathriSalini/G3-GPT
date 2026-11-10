import "./chat.css";
import { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "./Mycontext.jsx";
import Logo from "./Logo.jsx";

//reply formating
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

const fmtTime = (t) => {
    if (!t) return "";
    const d = new Date(t);
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const SUGGESTIONS = [
    { icon: "fa-globe", text: "What are today's top tech headlines?" },
    { icon: "fa-chart-line", text: "What's the latest Bitcoin price?" },
    { icon: "fa-code", text: "Explain async/await in JavaScript with an example" },
    { icon: "fa-clock-rotate-left", text: "What did I ask you earlier, and when?" },
];

function CopyBtn({ text }) {
    const [done, setDone] = useState(false);
    return (
        <button className="iconBtn" title="Copy" onClick={async () => {
            try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* ignore */ }
        }}>
            <i className={done ? "fa-solid fa-check" : "fa-regular fa-copy"}></i>
        </button>
    );
}

function Chat({ onSuggest }) {
    const { newChat, preChats } = useContext(MyContext);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [preChats]);

    if (newChat && (!preChats || preChats.length === 0)) {
        return (
            <div className="welcome">
                <Logo size={64} />
                <h1>How can I help you today?</h1>
                <p className="welcomeSub">Fast answers, live web search, and a memory of what you ask.</p>
                <div className="suggestions">
                    {SUGGESTIONS.map(s => (
                        <button key={s.text} onClick={() => onSuggest?.(s.text)}>
                            <i className={`fa-solid ${s.icon}`}></i>{s.text}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="chats">
            {
                preChats?.map((chat, idx) => (
                    <div className={chat.role === "user" ? "userDiv" : "g3gptDiv"} key={idx}>
                        {
                            chat.role === "user" ?
                                <div className="userCol">
                                    <p className="userprompt">{chat.content}</p>
                                    {chat.timestamp && <span className="askedAt">Asked {fmtTime(chat.timestamp)}</span>}
                                </div> :
                                <>
                                    <div className="botRow">
                                        <Logo size={26} />
                                        <div className="botBody">
                                            {chat.status && <p className="agentStatus"><span className="dot"></span>{chat.status}…</p>}
                                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                                {chat.content}
                                            </ReactMarkdown>
                                            {chat.sources?.length > 0 &&
                                                <div className="sources">
                                                    {chat.sources.map((s, i) => (
                                                        <a key={i} href={s.url} target="_blank" rel="noreferrer noopener" title={s.title}>
                                                            <b>{i + 1}</b> {host(s.url)}
                                                        </a>
                                                    ))}
                                                </div>}
                                            {chat.content && !chat.status && <div className="msgActions"><CopyBtn text={chat.content} /></div>}
                                        </div>
                                    </div>
                                </>
                        }
                    </div>
                ))
            }
            <div ref={endRef}></div>
        </div>
    )
}


export default Chat;
