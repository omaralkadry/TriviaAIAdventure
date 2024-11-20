
import React from "react";
import "./Leaderboard.css";

const Leaderboard = () => {
  const players = [
    { name: "Player 1", score: 1200 },
    { name: "Player 2", score: 1100 },
    { name: "Player 3", score: 1050 },
  ];

  return (
    <div className="leaderboard">
      {players.map((player, index) => (
        <div key={index} className="leaderboard-card">
          <h3>{player.name}</h3>
          <p>Score: {player.score}</p>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
    