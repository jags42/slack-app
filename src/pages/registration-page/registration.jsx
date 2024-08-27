import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./registration.css";

export const API_URL = "http://206.189.91.54/api/v1";

const Registration = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error before making the request

    try {
      const response = await fetch(`${API_URL}/auth/sign_in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        console.log("Login Successful:", data);
        navigate("/home");
      } else {
        // Login failed
        setError(data.errors ? data.errors.join(", ") : "Login failed");
      }
    } catch (err) {
      setError("An error occurred while logging in. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="home-page">
      <div className="login-box">
        <img alt="Avion Bank Logo" className="logo" />
        <h2 className="loginGreeting">Slack App</h2>
        <h3 className="loginAction">Let's Sign You In.</h3>
        <form onSubmit={handleSubmit}>
          <input
            className="emailForm"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="passwordForm"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <a href="/forget" className="forgot-password">
            Forgot Password?
          </a>
          <button type="submit">Sign In</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Registration;
