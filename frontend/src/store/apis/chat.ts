import client from './client';

export type sendNewMessagePostReqType = {
    url: string,
    message: string
};

export const sendNewMessage = async (payload: sendNewMessagePostReqType) => {
  const response = await client.post<sendNewMessagePostReqType>(`/api/chat/`, payload);
  return response.data;
};

export type createNewURLPostReqType = {
    url: string,
};

export const createNewURL = async (payload: createNewURLPostReqType) => {
  const response = await client.post<createNewURLPostReqType>(`/api/chat/`, payload);
  return response.data;
};

export const getChats = async () => {
    const response = await client.get(`/api/chat/`);
    return response.data;
};

export const getGraphChatRooms = async (payload: getGraphReqType) => {
  const queryString = payload.superConcept ? `?superConcept=${encodeURIComponent(payload.superConcept)}` : '';
  const response = await client.get(`/api/graph-chat-list/${queryString}`);
  return response.data;
};

export const createNewGraphChatRooms = async (payload: createNewGraphChatRoomsReqType) => {
  const response = await client.post<createNewGraphChatRoomsReqType>(`/api/graph-chat-list/`, payload);
  return response.data;
};

export const getGraphChatDetails = async () => {
  const response = await client.get(`/api/graph-chat-detail/`);
  return response.data;
}; 

export const createNewGraphChatMsg = async (payload: createNewGraphChatMsgReqType) => {
  const response = await client.post<createNewGraphChatMsgReqType>(`/api/graph-chat-list/`, payload);
  return response.data;
};

export type constructGraphPostReqType = {
    url: string,
};

export type getGraphReqType = {
  superConcept?: string,
};

export const getGraph = async (payload: getGraphReqType) => {
  const queryString = payload.superConcept ? `?superConcept=${encodeURIComponent(payload.superConcept)}` : '';
  const response = await client.get(`/api/graph/${queryString}`);
  return response.data;
};

export const constructGraph = async (payload: constructGraphPostReqType) => {
  const response = await client.post<constructGraphPostReqType>(`/api/graph/`, payload);
  return response.data;
};

export const getSuperConcept = async () => {
  const response = await client.get(`/api/superconcept/`);
  return response.data;
};

export interface Node {
  id: number;
  name: string;
  description: string;
  priority: number;
  comp_score: number;
}

export type editGraphNodePutReqType = {
  id: number,
  description: string,
  priority: number,
  comp_score: number,
};

export const editGraphNode = async (payload: editGraphNodePutReqType) => {
  const response = await client.put<editGraphNodePutReqType>(`/api/concept/`, payload);
  return response.data;
};

export type getGraphChatRoomsReqType = {
  superConcept?: number,
};
export type createNewGraphChatRoomsReqType = {
  superConcept: number,
};
export type getGraphChatDetailsReqType = {
  chatRoomId: number,
};
export type createNewGraphChatMsgReqType = {
  chatRoomId: number,
  message: string,
};