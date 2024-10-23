import React, { useState } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';

const Leaderboard = () => {
  // Temporary leaderboard data
  const [users, setUsers] = useState([
    { rank: 1, name: "Alice", score: 1500, questionsAnswered: 20, timeTaken: '35m' },
    { rank: 2, name: "Bob", score: 1200, questionsAnswered: 15, timeTaken: '42m' },
    { rank: 3, name: "Charlie", score: 950, questionsAnswered: 18, timeTaken: '50m' },
    { rank: 4, name: "David", score: 800, questionsAnswered: 12, timeTaken: '48m' },
    { rank: 5, name: "Eve", score: 720, questionsAnswered: 10, timeTaken: '38m' } 
  ]);
  const [sort, setSort] = useState(-1)

  // Sorts a column: score, questions, or time
  const handleSort = (sortBy) => {
    let sortedUsers = [...users];
    sortedUsers.sort((a, b) => {
      if (sortBy === 'score') {
        setSort(2);
        return b.score - a.score;
      } else if (sortBy === 'questionsAnswered') {
        setSort(3);
        return b.questionsAnswered - a.questionsAnswered;
      } else if (sortBy === 'timeTaken') {
        setSort(4);
        return b.timeTaken.localeCompare(a.timeTaken, undefined, { numeric: true });
      } else {
        setSort(-1);
        return 0;
      }
    });
    setUsers(sortedUsers);
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Table striped bordered hover responsive className="mb-0">
            <thead>
              <tr>
                <th 
                  colSpan="100%" 
                  className="text-center"
                >
                  <strong>Leaderboard</strong>
                </th>
              </tr>
              <tr>
                <th 
                  onClick={() => handleSort('score')} 
                  className={`cursor-pointer ${sort === 0 ? 'bg-light text-dark' : ''}`}
                >
                  Rank
                </th> 
                <th 
                  onClick={() => handleSort('name')} 
                  className={`cursor-pointer ${sort === 1 ? 'bg-light text-dark' : ''}`}
                >
                  Name
                </th>
                <th 
                  onClick={() => handleSort('score')} 
                  className={`cursor-pointer ${sort === 2 ? 'bg-light text-dark' : ''}`}
                >
                  Score
                </th>
                <th 
                  onClick={() => handleSort('questionsAnswered')} 
                  className={`cursor-pointer ${sort === 3 ? 'bg-light text-dark' : ''}`}
                >
                  Questions</th> 
                <th 
                  onClick={() => handleSort('timeTaken')} 
                  className={`cursor-pointer ${sort === 4 ? 'bg-light text-dark' : ''}`}
                >
                    Time
                  </th> 
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.name}>
                  <td>{user.rank}</td>
                  <td>{user.name}</td>
                  <td>{user.score}</td>
                  <td>{user.questionsAnswered}</td>
                  <td>{user.timeTaken}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Leaderboard;
