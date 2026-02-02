import "./chatWindow.css";
import Chat from "./Chat.jsx";

function ChatWindow() {
    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>G3-GPT &nbsp; {/* <i className="fa-solid fa-arrow-down"></i> */}</span>
                <div className="userIcondiv">
                    <span className="userIcon">  <i className="fa-regular fa-user"></i> </span>
                </div>
            </div>
            <Chat></Chat>

            <div className="inputArea">
                <div className="userInput">
                    <input placeholder="ask anything..."></input>
                    <div id="submit"><i class="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    G3-GPT can make mistakes. Please verify critical information from reliable sources.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;