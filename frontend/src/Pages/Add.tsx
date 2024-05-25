import React, { useEffect, useState } from 'react';
import styled  from 'styled-components';
import { TextField, Button, Container, CssBaseline, Paper, Typography, CircularProgress } from '@mui/material';
import { Chat, MessageTuple } from '../Components/Chat';
import { useDispatch } from 'react-redux';
import { chatActions } from '../store/slices/chat';
import { useAppSelector } from '../hooks/useAppSelector';
import { ListView } from '../Components/ChatList';

export const transformString = (input: string, rev?: boolean) : MessageTuple[] => {
    const parts = input.split('<|THISISCHATSEP|>');
    const keys = rev ? ["User", "AI"]: ["AI", "User"];
    return parts.map((part, index) => [keys[index % keys.length], part]);
};

const AddNewKnowledge: React.FC = () => {
  const dispatch = useDispatch();
  
  const chatLists = useAppSelector((state) => state.chat.chatList);
  const articleChats = useAppSelector((state) => state.chat.chatSummary);
  const articleChatStat = useAppSelector((state) => state.chat.chatStatus);
  const graphExtStat = useAppSelector((state) => state.chat.constructGraph.status);

  const [input, setInput] = useState<string>('');
  const [chat, setChat] = useState<string>('');

  useEffect(() => {
    setInput("");
    setChat("");
    dispatch(chatActions.getChats());
    dispatch(chatActions.clearState());
  }, [dispatch]);

  const handleExtractConcepts = async () => {
    dispatch(chatActions.createNewURL({url: input}));
  };
  const handleAdditionalChats = async () => {
    dispatch(chatActions.sendNewMessage({url: input, message: chat}));
    setChat("");
  };
  const handleListItemClick = (item: string) => {
    setInput(item);
    dispatch(chatActions.createNewURL({url: item}));
  };
  const handleAddtoGraph = () => {
    dispatch(chatActions.constructGraph({ url: input }));
  }
  return (
    <Container component="main" maxWidth="xl">
      <CssBaseline />
      <MainContent>
        <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem', textAlign: 'center', flex: 1 }}>
          <FlexC>
            <Typography variant="h5" gutterBottom>
              Add New Knowledge
            </Typography>
            <FlexR>
              {articleChatStat === null ?
                <CircularProgress />
                :
                <Button variant="contained" color="primary" onClick={handleExtractConcepts} style={{ marginTop: '0rem', marginLeft: '1rem' }}>
                  Extract!
              </Button>}
              {articleChats !== null && (graphExtStat === null ? <CircularProgress /> : <Button variant="contained" color="primary" onClick={handleAddtoGraph} style={{ marginTop: '0rem', marginLeft: '1rem' }}>
                Add to Graph!
              </Button>)}
            </FlexR>
          </FlexC>
          <FormC>
          <TextField variant="outlined" margin="normal" required fullWidth id="input" label="Enter Keyword or URL" name="input" autoComplete="off" autoFocus value={input} onChange={(e) => setInput(e.target.value)} />
          </FormC>
          <FullDiv>
            {articleChats && <Chat messages={transformString(articleChats)} />}
          </FullDiv>
          {articleChats && <FormR>
          <TextField variant="outlined" margin="normal" required fullWidth id="input" label="Additional Chats about the URL" name="input" autoComplete="off" value={chat} onChange={(e) => setChat(e.target.value)} />
          {articleChatStat === null ?
            <CircularProgress />
            :
            <Button variant="contained" color="primary" onClick={handleAdditionalChats} style={{ marginTop: '1rem' }}>
            Send!
            </Button>
          }
          </FormR>}
        </Paper>
        <Paper elevation={3} style={{ padding: '2rem', marginLeft: '2rem', marginTop: '2rem', textAlign: 'center', flex: 0.05 }}>
          <strong>-- Past Chats --</strong>
          <ListView items={chatLists} onItemClick={handleListItemClick} currentItem={input}/>
        </Paper>
      </MainContent>
    </Container>
  );
};

export default AddNewKnowledge;

const FullDiv = styled.div`
  width: 100%;
`;

// Styled-components
const FlexR = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;
const FlexC = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
`;
const FormR = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
const FormC = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;