import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, ListItemText, Paper, TextField, Button, Typography, Divider } from '@mui/material';
import styled from '@emotion/styled';
import { useAppSelector } from '../hooks/useAppSelector';
import { chatActions } from '../store/slices/chat';
import { useDispatch } from 'react-redux';
import { Chat } from './Chat';
import { transformString } from '../Pages/Add';

const ChatRoom = ({ superConcept } : {superConcept: string}) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState<string>('');
  const [curRoom, setCurRoom] = useState<number>(-1);
  const chatLists = useAppSelector((state) => state.chat.getGraphChatRoom.graphChatRooms);
  const chatDetails = useAppSelector((state) => state.chat.getGraphChatDetails.chattingHistory);
  const chatMsgStatus = useAppSelector((state) => state.chat.createNewGraphChatMsg.status);

  const handleSendMessage = () => {
    if (input.trim()) {
      console.log({chatRoomId: curRoom, message: input});
      dispatch(chatActions.createNewGraphChatMsg({chatRoomId: curRoom, message: input}));
      setInput('');
      
    }
  };

  useEffect(() => {
    dispatch(chatActions.getGraphChatRooms({}));
  }, [dispatch]);

  useEffect(() => {
    dispatch(chatActions.getGraphChatDetails({ chatRoomId: curRoom }));
  }, [dispatch, chatMsgStatus, curRoom]);

  const handleItemClick = (id: number) => {
    setCurRoom(id);
    dispatch(chatActions.getGraphChatDetails({ chatRoomId: id }));
  };

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
          {chatLists && chatLists.map((cL: any) => <StyledListItem key={cL.id} onClick={() => handleItemClick(parseInt(cL.id))} isSelected={curRoom === cL.id}>
            <ListItemText primary={cL.name} />
          </StyledListItem>)}
        </List>
      </Sidebar>
      <MainChatArea>
        <ChatHeader>
          <Typography variant="h6">Chat Room</Typography>
        </ChatHeader>
        <ChatWindow>
          {chatDetails && <Chat messages={transformString(chatDetails, true)} rev={true} />}
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

const StyledListItem = styled(({ isSelected, ...rest } : any) => <ListItem {...rest} />)`
  cursor: pointer;
  background-color: ${({ isSelected }) => (isSelected ? '#f0f0f0' : 'inherit')};
  color: ${({ isSelected }) => (isSelected ? 'blue' : 'inherit')};
  &:hover {
    background-color: #e0e0e0;
  }
`;