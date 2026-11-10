import "./chatWindow.css";
import Chat from "./Chat.jsx";
import Logo from "./Logo.jsx";
import { MyContext } from "./Mycontext.jsx";
import { useContext, useState, useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import API_BASE_URL from "./api";

function ChatWindow() {

    const navigate = useNavigate();
    const [, , removeCookie] = useCookies(["token"]);

    const { prompt, setPrompt, setReply, currThreadId, setPreviousChats, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setisOpen] = useState(false);
    const [webSearch, setWebSearch] = useState(() => {
        try { return localStorage.getItem("g3_websearch") !== "off"; } catch { return true; }
    });
    const toggleSearch = () => setWebSearch(v => {
        try { localStorage.setItem("g3_websearch", v ? "off" : "on"); } catch { /* ignore */ }
        return !v;
    });
    const abortRef = useRef(null);
    const inputRef = useRef(null);

    // auto-grow the composer
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }, [prompt]);

    const getReply = async (text) => {
        const message = (typeof text === "string" ? text : prompt).trim();
        if (!message || loading) return;
        setLoading(true);
        setNewChat(false);
        setPrompt("");
        setReply(null);

        // optimistic: user bubble + empty assistant bubble that fills as tokens stream in
        setPreviousChats(prev => [...prev,
            { role: "user", content: message, timestamp: new Date().toISOString() },
            { role: "assistant", content: "", status: "Thinking", sources: [] }]);

        const updateLast = (fn) => setPreviousChats(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = fn(copy[copy.length - 1]);
            return copy;
        });

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                signal: controller.signal,
                body: JSON.stringify({ message, threadId: currThreadId, webSearch })
            });
            if (!response.ok || !response.body) throw new Error(`Request failed (${response.status})`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buf = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const parts = buf.split("\n\n");
                buf = parts.pop();
                for (const part of parts) {
                    if (!part.startsWith("data:")) continue;
                    const evt = JSON.parse(part.slice(5));
                    if (evt.type === "token") updateLast(m => ({ ...m, content: m.content + evt.text, status: null }));
                    else if (evt.type === "status") updateLast(m => ({ ...m, status: evt.text }));
                    else if (evt.type === "sources") updateLast(m => ({ ...m, sources: evt.sources }));
                    else if (evt.type === "error") updateLast(m => ({ ...m, status: null, content: `⚠️ ${evt.error}` }));
                    else if (evt.type === "done") updateLast(m => ({ ...m, status: null }));
                }
            }
        } catch (err) {
            if (err.name === "AbortError") {
                updateLast(m => ({ ...m, status: null, content: m.content || "_Stopped._", stopped: true }));
            } else {
                console.log(err);
                updateLast(m => ({ ...m, status: null, content: m.content || `⚠️ ${err.message}` }));
            }
        }
        abortRef.current = null;
        setLoading(false);
    }

    const stop = () => abortRef.current?.abort();

    const logout = () => {
        removeCookie("token", { path: '/' });
        navigate("/");
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="navBrand">
                    <Logo size={30} withText />
                </div>
                <div className="userIcondiv" onClick={() => setisOpen(!isOpen)}>
                    <span className="userIcon">  <i className="fa-regular fa-user"></i> </span>
                </div>
            </div>
            {
                isOpen &&
                <div className="settingOptions">
                    <div onClick={logout} className="settingItem"><i className="fa-solid fa-arrow-right-from-bracket"></i>Log Out</div>
                </div>
            }
            <Chat onSuggest={getReply}></Chat>
            <div className="inputArea">
                <div className="userInput">
                    <button type="button" className={`searchToggle ${webSearch ? "on" : ""}`} onClick={toggleSearch}
                        title={webSearch ? "Web search is ON: click to turn off" : "Web search is OFF: click to turn on"}
                        aria-pressed={webSearch}>
                        <i className="fa-solid fa-globe"></i> Search
                    </button>
                    <textarea ref={inputRef} rows={1} placeholder="Ask anything…"
                        value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); getReply(); }
                        }}>
                    </textarea>
                    {loading
                        ? <button id="submit" className="stopBtn" onClick={stop} title="Stop generating"><i className="fa-solid fa-stop"></i></button>
                        : <button id="submit" onClick={() => getReply()} disabled={!prompt.trim()} title="Send"><i className="fa-solid fa-arrow-up"></i></button>}
                </div>
                <p className="info">
                    G3-GPT searches the web when needed and remembers your chats. It can still make mistakes — verify critical info.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;
