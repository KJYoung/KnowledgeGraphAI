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

export const getGraphChatRooms = async (payload: getGraphChatRoomsReqType) => {
  const queryString = payload.super_concept_id ? `?superConcept=${encodeURIComponent(payload.super_concept_id)}` : `?superConcept=${encodeURIComponent('-1')}`;
  const response = await client.get(`/api/graph_chat_list/${queryString}`);
  return response.data;
};

export const createNewGraphChatRooms = async (payload: createNewGraphChatRoomsReqType) => {
  const response = await client.post<createNewGraphChatRoomsReqType>(`/api/graph_chat_list/`, payload);
  return response.data;
};

export const getGraphChatDetails = async (payload: getGraphChatDetailsReqType) => {
  const response = await client.get(`/api/graph_chat_detail/?id=${encodeURIComponent(payload.chatRoomId)}`);
  return response.data;
}; 

export const createNewGraphChatMsg = async (payload: createNewGraphChatMsgReqType) => {
  const response = await client.post<createNewGraphChatMsgReqType>(`/api/graph_chat_detail/`, payload);
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
  super_concept_id?: number,
};
export type createNewGraphChatRoomsReqType = {
  superConcept: string,
};
export type getGraphChatDetailsReqType = {
  chatRoomId: number,
};
export type createNewGraphChatMsgReqType = {
  chatRoomId: number,
  message: string,
};


export type postFuncCallReqType = {
  url: string,
};
export const postfuncCall = async (payload: postFuncCallReqType) => {
  const response = await client.post<postFuncCallReqType>(`/api/search/`, payload);
  return response.data;
};