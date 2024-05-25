import React, { useEffect, useState } from 'react';
import { Graph } from 'react-d3-graph';
import styled, { keyframes } from 'styled-components';
import { TextField, Button, Container, CssBaseline, Paper, Typography, CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { chatActions } from '../store/slices/chat';
import { useAppSelector } from '../hooks/useAppSelector';
import { graphConfig } from '../utils/d3GraphConfig';
import { ListView } from '../Components/ChatList';

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

const GraphVisualization: React.FC = () => {
  const dispatch = useDispatch();
  
  const [superConcept, setSuperConcept] = useState<string>("");
  const superConcepts = useAppSelector((state) => state.chat.superConcepts.superConcepts);
  const graphData = useAppSelector((state) => state.chat.getGraph.graph);

  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    dispatch(chatActions.getGraph());
    dispatch(chatActions.getSuperConcept());
  }, [dispatch]);

  const handleListItemClick = (item: string) => {
    setSuperConcept(item);
    dispatch(chatActions.createNewURL({url: item}));
  };

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
    <Container component="main" maxWidth="xl">
      <CssBaseline />
      <MainContent>
        <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem', textAlign: 'center', flex: 1 }}>  
          <GraphContainer>
            {graphData && graphData.nodes.length > 0 && (
                <>
                <Graph
                id="knowledge-graph"
                data={graphData}
                config={graphConfig}
                // config={{ ...graphConfig, initialZoom: zoomLevel }}
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
        <Paper elevation={3} style={{ padding: '2rem', marginLeft: '2rem', marginTop: '2rem', textAlign: 'center', flex: 0.05 }}>
        {/* <ListViewContainer> */}
          <strong>-- SuperConcepts --</strong>
          {superConcepts && <ListView items={superConcepts} onItemClick={handleListItemClick} />}
        {/* </ListViewContainer> */}
        </Paper>
      </MainContent>
    </Container>
  );
};

export default GraphVisualization;

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