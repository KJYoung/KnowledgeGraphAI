import React, { useEffect, useState } from 'react';
import { Graph } from 'react-d3-graph';
import styled, { keyframes } from 'styled-components';
import { TextField, Button, Container, CssBaseline, Paper, Typography, CircularProgress } from '@mui/material';
import { Chat, MessageTuple } from '../Components/Chat';
import { useDispatch } from 'react-redux';
import { chatActions } from '../store/slices/chat';
import { useAppSelector } from '../hooks/useAppSelector';
import { graphConfig } from '../utils/d3GraphConfig';
import { ListView } from '../Components/ChatList';

const transformString = (input: string) : MessageTuple[] => {
    const parts = input.split('<|THISISCHATSEP|>');
    const keys = ["AI", "User"];
    return parts.map((part, index) => [keys[index % keys.length], part]);
};

// Parse the graph data
//   const graph = JSON.parse(data.graph);

//   const formattedGraphData = {
// 	nodes: graph.nodes.map((node: any) => ({
// 	  id: node.id || 'undefined_node'
// 	})),
// 	links: graph.links.map((link: any) => ({
// 	  source: link.source || 'undefined_source',
// 	  target: link.target || 'undefined_target'
// 	}))
//   };

//   setGraphData(formattedGraphData);

const AddNewKnowledge: React.FC = () => {
  const dispatch = useDispatch();
  
  const chatLists = useAppSelector((state) => state.chat.chatList);
  const articleChats = useAppSelector((state) => state.chat.chatSummary);
  const articleChatStat = useAppSelector((state) => state.chat.chatStatus);

  const [input, setInput] = useState<string>('');
  const [chat, setChat] = useState<string>('');
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  // const [article, setArticle] = useState<Article | null>(null); // Add this line

  useEffect(() => {
    dispatch(chatActions.getChats());
  }, [dispatch]);

  const handleExtractConcepts = async () => {
    dispatch(chatActions.createNewURL({url: input}));
  };
  const handleAdditionalChats = async () => {
    setChat("");
    dispatch(chatActions.sendNewMessage({url: input, message: chat}));
  };
  const handleListItemClick = (item: string) => {
    setInput(item);
    dispatch(chatActions.createNewURL({url: item}));
  };
  const handleAddtoGraph = () => {
    dispatch(chatActions.constructGraph({}));
  }

  const onClickNode = (nodeId: string) => {
    console.log(`Clicked node ${nodeId}`);
  };

  const onClickLink = (source: string, target: string) => {
    console.log(`Clicked link between ${source} and ${target}`);
  };

  const handleZoomIn = () => {
    setZoomLevel((prevZoomLevel) => prevZoomLevel + 0.2);
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoomLevel) => Math.max(prevZoomLevel - 0.2, 0.2));
  };

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <MainContent>
      <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem', textAlign: 'center', flex: 1 }}>
        <Typography variant="h5" gutterBottom>
        Add New Knowledge
        </Typography>
        <FormC>
        <TextField variant="outlined" margin="normal" required fullWidth id="input" label="Enter Keyword or URL" name="input" autoComplete="off" autoFocus value={input} onChange={(e) => setInput(e.target.value)} />
        {articleChatStat === null ?
          <CircularProgress />
          :
          <Button variant="contained" color="primary" onClick={handleExtractConcepts} style={{ marginTop: '1rem' }}>
          Extract Concepts
          </Button>
        }
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
        <Button variant="contained" color="primary" onClick={handleAddtoGraph} style={{ marginTop: '1rem' }}>
        Add to Graph!
        </Button>
        <GraphContainer>
        {graphData.nodes.length > 0 && (
          <>
          <Graph
            id="knowledge-graph"
            data={graphData}
            config={{ ...graphConfig, initialZoom: zoomLevel }}
            onClickNode={onClickNode}
            onClickLink={onClickLink}
            onZoomChange={(prevZoom, newZoom) => setZoomLevel(newZoom)}
          />
          <ZoomControls>
            <Button variant="contained" color="primary" onClick={handleZoomIn}>
            +
            </Button>
            <Button variant="contained" color="primary" onClick={handleZoomOut}>
            -
            </Button>
            <span>
            Zoom: {zoomLevel.toFixed(2)}
            </span>
          </ZoomControls>
          </>
        )}
        </GraphContainer>
      </Paper>
      <ListViewContainer>
        <strong>-- Past Chats --</strong>
        <ListView items={chatLists} onItemClick={handleListItemClick} />
      </ListViewContainer>
      </MainContent>
    </Container>
  );
};

export default AddNewKnowledge;

const FullDiv = styled.div`
  width: 100%;
`;

// Styled-components
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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const GraphContainer = styled.div`
  margin-top: 2rem;
  position: relative;
  animation: ${fadeIn} 1s ease-in;
`;

const ZoomControls = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;

  button {
    margin-bottom: 0.5rem;
  }
`;

const ListViewContainer = styled.div`
  margin-left: 20px;
  width: 250px;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;