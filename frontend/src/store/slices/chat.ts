/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { put, call, takeLatest } from 'redux-saga/effects';
import * as chatAPI from '../apis/chat';

type Status = boolean | null | undefined; 

interface ChatState {
  chatList: string[];
  chatSummary: string | null;
  chatStatus: Status; // True: 성공, False: 실패, null: 로딩중, undefined: 아직 안함.
  error: AxiosError | null;
  constructGraph: {
    status: Status; // True: 성공, False: 실패, null: 로딩중, undefined: 아직 안함.
  },
  getGraph: {
    graph: any,
    status: Status,
  },
  superConcepts: {
    superConcepts: any,
    status: Status,
  },
}

export const initialState: ChatState = {
  chatList: [],
  chatSummary: null,
  chatStatus: undefined, 
  error: null,
  constructGraph: {
    status: undefined,
  },
  getGraph: {
    graph: null,
    status: undefined,
  },
  superConcepts: {
    superConcepts: null,
    status: undefined,
  }
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearState: state => {
        state.chatSummary = null;
        state.error = null;
        state.chatStatus = undefined;
        state.constructGraph.status = undefined;
    },
    getChats: state => {
        state.chatStatus = null;
    },
    getChatsSuccess: (state, { payload }) => {
        state.chatList = payload.chats;
        state.chatStatus = true;
    },
    getChatsFailure: (state, { payload }) => {
        state.chatList = [];
        state.chatStatus = false;
    },
    sendNewMessage: (state, action: PayloadAction<chatAPI.sendNewMessagePostReqType>) => {
        state.chatStatus = null;
    },
    sendNewMessageSuccess: (state, { payload }) => {
        state.chatSummary = payload.summary;
        state.chatStatus = true;
    },
    sendNewMessageFailure: (state, { payload }) => {
        state.chatStatus = false;
    },
    createNewURL: (state, action: PayloadAction<chatAPI.createNewURLPostReqType>) => {
        state.chatStatus = null;
    },
    createNewURLSuccess: (state, { payload }) => {
        state.chatSummary = payload.summary;
        state.chatStatus = true;
    },
    createNewURLFailure: (state, { payload }) => {
        state.chatStatus = false;
    },
    constructGraph: (state, action: PayloadAction<any>) => {
        state.constructGraph.status = null;
    },
    constructGraphSuccess: (state, { payload }) => {
        state.constructGraph.status = true;
    },
    constructGraphFailure: (state, { payload }) => {
        state.constructGraph.status = false;
    },
    getGraph: state => {
        state.getGraph.status = null;
    },
    getGraphSuccess: (state, { payload }) => {
        state.getGraph.graph = payload.graph;
        state.getGraph.status = true;
    },
    getGraphFailure: (state, { payload }) => {
        state.getGraph.graph = null;
        state.getGraph.status = false;
    },
    getSuperConcept: state => {
        state.superConcepts.status = null;
    },
    getSuperConceptSuccess: (state, { payload }) => {
        state.superConcepts.superConcepts = payload.super_concepts;
        state.superConcepts.status = true;
    },
    getSuperConceptFailure: (state, { payload }) => {
        state.superConcepts.superConcepts = null;
        state.superConcepts.status = false;
    },
  },
});
export const chatActions = chatSlice.actions;

function* getChatsSaga() {
    try {
      const response: AxiosResponse = yield call(chatAPI.getChats);
      yield put(chatActions.getChatsSuccess(response));
    } catch (error) {
      yield put(chatActions.getChatsFailure(error));
    }
}
function* getGraphSaga() {
    try {
      const response: AxiosResponse = yield call(chatAPI.getGraph);
      yield put(chatActions.getGraphSuccess(response));
    } catch (error) {
      yield put(chatActions.getGraphFailure(error));
    }
}
function* getSuperConceptSaga() {
    try {
      const response: AxiosResponse = yield call(chatAPI.getSuperConcept);
      yield put(chatActions.getSuperConceptSuccess(response));
    } catch (error) {
      yield put(chatActions.getSuperConceptFailure(error));
    }
}
function* sendNewMessageSaga(action: PayloadAction<chatAPI.sendNewMessagePostReqType>) {
    try {
      const response: AxiosResponse = yield call(chatAPI.sendNewMessage, action.payload);
      yield put(chatActions.sendNewMessageSuccess(response));
    } catch (error) {
      yield put(chatActions.sendNewMessageFailure(error));
    }
}
function* createNewURLSaga(action: PayloadAction<chatAPI.createNewURLPostReqType>) {
    try {
      const response: AxiosResponse = yield call(chatAPI.createNewURL, action.payload);
      yield put(chatActions.createNewURLSuccess(response));
    } catch (error) {
      yield put(chatActions.createNewURLFailure(error));
    }
}
function* constructGraphSaga(action: PayloadAction<chatAPI.constructGraphPostReqType>) {
    try {
      const response: AxiosResponse = yield call(chatAPI.constructGraph, action.payload);
      yield put(chatActions.constructGraphSuccess(response));
    } catch (error) {
      yield put(chatActions.constructGraphFailure(error));
    }
}

export default function* chatSaga() {
  yield takeLatest(chatActions.getChats, getChatsSaga);
  yield takeLatest(chatActions.getGraph, getGraphSaga);
  yield takeLatest(chatActions.getSuperConcept, getSuperConceptSaga);
  yield takeLatest(chatActions.sendNewMessage, sendNewMessageSaga);
  yield takeLatest(chatActions.createNewURL, createNewURLSaga);
  yield takeLatest(chatActions.constructGraph, constructGraphSaga);
}
