import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { useSocket } from "../services/SocketContext";

function Scores() {
  const [scores, setScores] = useState({});
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpdateScores = (updatedScores) => {
      console.log('Updated Scores:', updatedScores);
      setScores(updatedScores);
    };

    socket.on('update scores', handleUpdateScores);

    return () => {
      socket.off('update scores', handleUpdateScores);
    };
  }, [socket] );

  return (
    <>
      <Table hover>
        <tbody>
          {Object.entries(scores).map(([player, score], index) => (
            <tr key={index}>
              <td>{player}</td>
              <td>{score}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default Scores;