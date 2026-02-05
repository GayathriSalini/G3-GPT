import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import '../Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState({
        email: "",
        password: "",
        username: "",
    });
    const { email, password, username } = inputValue;

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setInputValue({
            ...inputValue,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                "http://localhost:8000/signup",
                { ...inputValue },
                { withCredentials: true }
            );
            const { success, message } = data;
            if (success) {
                toast.success(message);
                console.log("Signup successful, redirecting to login...");
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            } else {
                toast.error(message);
            }
        } catch (error) {
            console.error("Signup error:", error);
            toast.error("Signup failed. Please try again.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="logo-container">
                    <span className="auth-logo">G3-GPT</span>
                </div>
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join G3-GPT and start chatting with AI</p>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={username}
                            placeholder="Choose a username"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={password}
                            placeholder="Create a password"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">Sign Up</button>
                </form>
                <div className="auth-footer">
                    <span>Already have an account?</span>
                    <Link to="/login" className="auth-link">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
