import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
import "./HomePage.css";

const HomePage = () => {
    const navigate = useNavigate();
    const { getUsername } = useAuth();
    const [roomName, setRoomName] = useState("");
    const [roomCode, setRoomCode] = useState("");

    const handleCreateRoom = () => {
        if (getUsername) {
            navigate(`/room`);
        }
        // if (roomName.trim()) {
        //     navigate(`/room?name=${encodeURIComponent(roomName)}`);
        // }
    };
    
    // const handleJoinRoom = () => {
    //     if (roomCode.trim()) {
    //         navigate(`/room?code=${encodeURIComponent(roomCode)}`);
    //     }
    // };
    // useEffect(() => {
    //     if (getUsername) {
    //         setRoomName(getUsername);
    //     }
    //   }, [roomName]);

    return (
        <div className="homepage-content">
            <h1 className="homepage-title">Welcome to Trivia Ai Adventure</h1>
            <p className="homepage-subtitle">Test your knowledge and challenge your friends!</p>
            <div className="homepage-cards">
                <div className="card">
                    {/*<h2 className="card-title">Create a Room</h2>*/}
                    <p className="card-subtitle">Start a new trivia game and invite your friends</p>
                    {/*
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Enter room name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    /> 
                    <button className="btn" onClick={handleCreateRoom}>Start</button>
                    */}
                    <button
                        className="btn"
                        onClick={() => {
                            //setRoomName(getUsername); 
                            handleCreateRoom();
                        }}
                        > Start
                    </button>
                </div>
                {/*
                <div className="card">
                    <h2 className="card-title">Join a Room</h2>
                    <p className="card-subtitle">Enter a room code to join an existing game</p>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                    />
                    <button className="btn" onClick={handleJoinRoom}>Join Room</button>
                </div>
                */}
            </div>
        </div>
    );
};

export default HomePage;
