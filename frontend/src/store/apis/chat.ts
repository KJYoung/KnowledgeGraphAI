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

export type constructGraphPostReqType = {
    url: string,
};

export const getGraph = async () => {
  const response = await client.get(`/api/graph/`);
  return response.data;
};

export const constructGraph = async (payload: constructGraphPostReqType) => {
  const response = await client.post<constructGraphPostReqType>(`/api/graph/`, payload);
  return response.data;
};