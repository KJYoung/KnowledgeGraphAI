import React, { useEffect, useState } from 'react';
import { Graph } from 'react-d3-graph';
import styled, { keyframes } from 'styled-components';
import { TextField, Button, Container, CssBaseline, Paper, Typography, CircularProgress, Modal, FormControlLabel, Checkbox, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { chatActions } from '../store/slices/chat';
import { useAppSelector } from '../hooks/useAppSelector';
import { graphConfig } from '../utils/d3GraphConfig';
import { ListView } from '../Components/ChatList';
import { Node } from '../store/apis/chat';

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

const determineNodeColor = (comp_score: number): string => {
  // Adjust the logic based on your comp_score thresholds and colors
  if (comp_score > 80) return 'green';
  if (comp_score > 50) return 'yellow';
  if (comp_score > 20) return 'orange';
  return 'red';
};

const GraphVisualization: React.FC = () => {
  const dispatch = useDispatch();
  
  const [superConcept, setSuperConcept] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const editNodeStatus = useAppSelector((state) => state.chat.editGraphNode.status);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedNode(null);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedNode) {
      setSelectedNode({ ...selectedNode, [e.target.name]: e.target.value });
    }
  };
  const superConcepts = useAppSelector((state) => state.chat.superConcepts.superConcepts);

  const rawGraphData = useAppSelector((state) => state.chat.getGraph.graph);
  const graphData = rawGraphData ? {
    nodes: rawGraphData.nodes.map((node: any) => ({
      ...node,
      color: determineNodeColor(node.comp_score),
    })),
    links: rawGraphData.links,
  } : null;

  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    dispatch(chatActions.getGraph({}));
    dispatch(chatActions.getSuperConcept());
  }, [dispatch]);
  useEffect(() => {
    if(editNodeStatus){
      dispatch(chatActions.getGraph({}));
    }
  }, [editNodeStatus, dispatch]);
  useEffect(() => {
    dispatch(chatActions.getGraph({ superConcept: superConcept }));
  }, [superConcept, dispatch]);

  const handleListItemClick = (item: string) => {
    setSuperConcept(item);
    dispatch(chatActions.createNewURL({url: item}));
  };

  const onClickNode = (nodeId: string) => {
    if(editMode && graphData){
      const clickedNode = graphData.nodes.find((n : any) => parseInt(n.id) === parseInt(nodeId));
      if (clickedNode) {
          setSelectedNode(clickedNode);
          setModalOpen(true);
      }
    }else{
        console.log(`Clicked node ${nodeId}`);
    }
  };
  const handleSave = () => {
    // Save the updated node information (you can also send this to the backend if needed)
    if (selectedNode) {
      dispatch(chatActions.editGraphNode({ id: selectedNode.id, description: selectedNode.description, priority: selectedNode.priority, comp_score: selectedNode.comp_score }));
    }
    handleModalClose();
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
          <FormControlLabel
            control={
                <Checkbox
                checked={editMode}
                onChange={(e) => setEditMode(e.target.checked)}
                name="editMode"
                color="primary"
                />
            }
            label="Edit Mode"
          /> 
          <GraphContainer>
            {!loading ? (graphData && graphData.nodes.length > 0 && (
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
            )) : <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>}
          </GraphContainer>
          <Modal
            open={modalOpen}
            onClose={handleModalClose}
          >
            <ModalContent>
              <Typography variant="h6" gutterBottom>
                Edit Node
              </Typography>
              <TextField
                margin="normal"
                fullWidth
                label="Description"
                name="description"
                value={selectedNode?.description || ''}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Priority"
                name="priority"
                type="number"
                value={selectedNode?.priority || ''}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Comp Score"
                name="comp_score"
                type="number"
                value={selectedNode?.comp_score || ''}
                onChange={handleInputChange}
              />
              <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '1rem' }}>
                Save
              </Button>
            </ModalContent>
        </Modal>
        </Paper>
        <Paper elevation={3} style={{ padding: '2rem', marginLeft: '2rem', marginTop: '2rem', textAlign: 'center', flex: 0.05 }}>
        {/* <ListViewContainer> */}
          <strong>-- SuperConcepts --</strong>
          {superConcepts && <ListView items={superConcepts} onItemClick={handleListItemClick} currentItem={superConcept}/>}
        {/* </ListViewContainer> */}
        </Paper>
      </MainContent>
    </Container>
  );
};

export default GraphVisualization;

const ModalContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 2rem;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  width: 400px;
  outline: none;
`;

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