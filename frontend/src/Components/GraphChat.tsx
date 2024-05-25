import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemText, Paper, TextField, Button, Typography, Divider } from '@mui/material';
import styled from '@emotion/styled';
import { useAppSelector } from '../hooks/useAppSelector';
import { chatActions } from '../store/slices/chat';
import { useDispatch } from 'react-redux';

const ChatRoom = ({ superConcept } : {superConcept: string}) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const chatLists = useAppSelector((state) => state.chat.getGraphChatRoom.graphChatRooms);

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput('');
    }
  };

  useEffect(() => {
    dispatch(chatActions.getGraphChatRooms({}));
  }, [dispatch]);

  return (
    <ChatContainer>
      <Sidebar>
        <Typography variant="h6" gutterBottom>
          Chat Rooms
        </Typography>
        <Button variant="contained" color="primary" onClick={() => {
          dispatch(chatActions.createNewGraphChatRooms({ superConcept : superConcept }));
        }}>
          +
        </Button>
        <Divider />
        <List>
          {chatLists && chatLists.map((cL: any) => <ListItem button>
            <ListItemText key={cL.name} primary={cL.name} />
          </ListItem>)}
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
