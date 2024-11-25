import React from "react";
import "./HomePage.css";

const HomePage = () => {
    return (
        <div className="homepage-content">
            <h1 className="homepage-title">Welcome to Trivia AI Adventure</h1>
            <div className="homepage-buttons">
                <a href="/room" className="btn btn-primary">
                    Create Room
                </a>
                <a href="/join" className="btn btn-secondary">
                    Join Room
                </a>
            </div>
        </div>
    );
};

export default HomePage;
