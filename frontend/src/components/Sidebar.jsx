import React, { useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import Chat from './Chat';
import Scores from './Scores';
import RoomCodeTab from './RoomCodeTab';
import './Sidebar.css';

function Sidebar({ roomCode }) {
    const [activeTab, setActiveTab] = useState('chat');

    const handleTabSelect = (key) => {
        setActiveTab(key);
    };

    return (
        <div className="sidebar-container">
            <Nav
                variant="pills"
                className="sidebar-tabs"
                activeKey={activeTab}
                onSelect={handleTabSelect}
            >
                <Nav.Item>
                    <Nav.Link eventKey="roomCode">Room Code</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="scores">Scores</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="chat">Chat</Nav.Link>
                </Nav.Item>
            </Nav>

            <Tab.Container activeKey={activeTab}>
                <Tab.Content>
                    <Tab.Pane eventKey="roomCode">
                        <RoomCodeTab roomCode={roomCode} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="scores">
                        <Scores />
                    </Tab.Pane>
                    <Tab.Pane eventKey="chat">
                        <Chat roomCode={roomCode} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    );
}

export default Sidebar;
