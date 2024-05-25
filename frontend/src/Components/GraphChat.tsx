import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, Paper, TextField, Button, Typography, Divider } from '@mui/material';
import styled from '@emotion/styled';

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput('');
    }
  };

  return (
    <ChatContainer>
      <Sidebar>
        <Typography variant="h6" gutterBottom>
          Chat Rooms
        </Typography>
        <Divider />
        <List>
          <ListItem button>
            <ListItemText primary="Contact 1" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Contact 2" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Contact 3" />
          </ListItem>
        </List>
      </Sidebar>
      <MainChatArea>
        <ChatHeader>
          <Typography variant="h6">Chat Room</Typography>
        </ChatHeader>
        <ChatWindow>
          {messages.map((message, index) => (
            <ChatMessage key={index} isUser={index % 2 === 0}>
              {message}
            </ChatMessage>
          ))}
        </ChatWindow>
        <ChatInputArea>
          <TextField
            fullWidth
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage}>
            Send
          </Button>
        </ChatInputArea>
      </MainChatArea>
    </ChatContainer>
  );
};

export default ChatRoom;

// Styled Components
const ChatContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
`;

const Sidebar = styled(Paper)`
  width: 300px;
  padding: 16px;
  overflow-y: auto;
`;

const MainChatArea = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled(Box)`
  padding: 16px;
  border-bottom: 1px solid #ddd;
`;

const ChatWindow = styled(Box)`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f5f5f5;
`;

const ChatMessage = styled(Box)<{ isUser: boolean }>`
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  background-color: ${(props) => (props.isUser ? '#e0f7fa' : '#fff')};
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
`;

const ChatInputArea = styled(Box)`
  display: flex;
  padding: 16px;
  border-top: 1px solid #ddd;
  background-color: #fff;
  > :first-of-type {
    flex: 1;
    margin-right: 16px;
  }
`;