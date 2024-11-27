import React, { useEffect, useState } from 'react';
import "./History.css";
import { useAuth } from '../../services/AuthContext.jsx';

const History = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, getUsername } = useAuth();
    const username = getUsername();


    useEffect(() => {
        console.log("Use Effect...");
        const fetchGameHistory = async () => {
            console.log("Fetching game history...");
            if (isAuthenticated) {
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username: username}),
                };
                try {
                    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/history`, options);
                    if (!response.ok) {
                        throw new Error('Failed to fetch game history');
                    }
                    const data = await response.json();
                    setGames(data);

                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }

                if (loading) return <div>Loading...</div>;
                if (error) return <div>Error: {error}</div>;
            }

        };

        fetchGameHistory();
    }, [isAuthenticated, username]);

    return (
        <div className="history-container">
            <h1>Game History</h1>
            {games.length === 0 ? (
                <p>No game history available.</p>
            ) : (
                <table className="history-table">
                    <thead>
                    <tr>
                        <th>Game Type</th>
                        <th>Score</th>
                        <th>Rank</th>
                        <th>Questions</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {games.map((game) => (
                        <tr key={game._id}>
                            <td>{game.gameID}</td>
                            <td>{game.score}</td>
                            <td>{game.rank}</td>
                            <td>{game.questionAmount}</td>
                            <td>{new Date(game.date).toLocaleDateString()}</td> {/* Format date */}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default History;