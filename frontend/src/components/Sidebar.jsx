import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab, Collapse, Button } from 'react-bootstrap';
import Chat from './Chat';
import Scores from './Scores';

function Sidebar({ roomCode }) {
  const [activeTab, setActiveTab] = useState('tab1');  // State to manage active tab

  const handleTabSelect = (key) => {
    setActiveTab(key);  // Update active tab when user clicks on a tab
  };

  return (
    <Container>
      <Col className="p-0">

        {/* Tabs */}
        <Nav 
          variant="pills" 
          className="flex-row"
          defaultActiveKey="tab1" 
          onSelect={handleTabSelect}
        >
          <Nav.Item>
            <Nav.Link eventKey="tab1">Chat</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="tab2">Scores</Nav.Link>
          </Nav.Item>
        </Nav>


        {/* Tab Content */}
        <Tab.Container activeKey={activeTab}>
          <Tab.Content>
            <Tab.Pane eventKey="tab1">
              <Chat roomCode={roomCode} />
            </Tab.Pane>
            <Tab.Pane eventKey="tab2">
              <Scores />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
        
      </Col>
    </Container>
  );
}

export default Sidebar;
