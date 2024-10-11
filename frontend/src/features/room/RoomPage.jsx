import { useState } from 'react';
import { Button, Card, Container, Col, Row, Table, Form } from 'react-bootstrap';

function RoomPage() {

	const players = Array.from({ length: 10 }, (_, i) => `player${i + 1}`);
	const code = 1234;
	const [mode, setMode] = useState(0);
	const [rounds, setRounds] = useState(1);
	const [duration, setDuration] = useState(5);

  return (
    <Container 
			lassName="d-flex align-items-center" 
			style={{ overflowY: 'auto'}}
		>
      <Row>
        <Col>
          <Table 
						bordered 
						hover 
						size="sm" 
						style={{ width: '300px' }}
					>
						<thead>
							Players
						</thead>
						<tbody>
						{players.map((player, idx) => (
							<tr key={idx}>
								<td>
									{player}
								</td>
							</tr>
						))}
						</tbody>
					</Table>
        </Col>
				<Col>
					<Card>
						<Row>
							<Col>
								Code:
							</Col>
							<Col>
								{code}
							</Col>
						</Row>
						<Row>
							<Col>
								Mode:
							</Col>
							<Col>
								<Form.Select onChange={(e) => setMode(parseInt(e.target.value, 10))}>
									<option value={0}>Classic Trivia</option>
									<option value={1}>Jeopardy</option>
									<option value={2}>Trivia Crack</option>
								</Form.Select>
							</Col>
						</Row>
						<Row>
							<Col>
								Rounds:
							</Col>
							<Col>
								<Form.Control 
									type='number' 
									value={rounds} 
									onChange={(e) => setRounds(parseInt(e.target.value, 10))} 
									min={1}
								/>
							</Col>
						</Row>
						<Row>
							<Col>
								Duration in seconds:
							</Col>
							<Col>
								<Form.Control 
									type='number' 
									value={duration} 
									onChange={(e) => setDuration(parseInt(e.target.value, 10))} 
									min={1}
								/>
							</Col>
						</Row>
						<Button>Start Game</Button>
					</Card>
				</Col>
      </Row>
    </Container>
  );
}

export default RoomPage;
