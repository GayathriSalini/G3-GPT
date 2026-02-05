import React, { useEffect, useContext, useState } from 'react';
import Sidebar from '../Sidebar.jsx';
import ChatWindow from '../chatWindow.jsx';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { MyContext } from '../Mycontext.jsx';
import { v1 as uuidv1 } from "uuid";
import { SyncLoader } from "react-spinners";

import axios from 'axios';

const Home = () => {
    const navigate = useNavigate();
    const [cookies] = useCookies(['token']);
    const { setPrompt, setReply, setcurrThreadId, setPreviousChats, setNewChat } = useContext(MyContext);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            console.log("Verifying user session...");
            try {
                const { data } = await axios.post(
                    "http://localhost:8000/",
                    {},
                    { withCredentials: true }
                );
                const { status, user } = data;
                if (!status) {
                    console.log("Session verification failed. Redirecting to login.");
                    navigate("/");
                } else {
                    console.log(`Verified as: ${user}`);
                    setNewChat(true);
                    setPrompt("");
                    setReply("");
                    setPreviousChats([]);
                    setcurrThreadId(uuidv1());
                    setVerifying(false);
                }
            } catch (error) {
                console.error("Verification error:", error);
                navigate("/");
            }
        };

        verifyUser();
    }, [navigate]); // Only run on mount

    if (verifying) {
        return (
            <div style={{
                color: 'white',
                background: '#212121',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <SyncLoader color="#fff" />
                <p>Establishing secure connection...</p>
            </div>
        );
    }

    return (
        <div className="main" style={{ display: 'flex', width: '100vw', height: '100vh' }}>
            <Sidebar />
            <ChatWindow />
        </div>
    );
};

export default Home;
