import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState({
        email: "",
        password: "",
    });
    const { email, password } = inputValue;

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
                "http://localhost:8000/login",
                { ...inputValue },
                { withCredentials: true }
            );
            const { success, message } = data;
            console.log("Login Response Data:", data);
            if (success) {
                toast.success(message);
                console.log("Login successful, navigating to Chat...");
                setTimeout(() => {
                    navigate("/home", { replace: true });
                }, 1000);
            } else {
                console.warn("Login unsuccessful:", message);
                toast.error(message);
            }
        } catch (error) {
            console.error("Login attempt error:", error);
            toast.error("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="logo-container">
                    <span className="auth-logo">G3-GPT</span>
                </div>
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access your account</p>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
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
                            placeholder="Enter your password"
                            onChange={handleOnChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">Login</button>
                </form>
                <div className="auth-footer">
                    <span>Don't have an account?</span>
                    <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

