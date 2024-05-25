/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { put, call, takeLatest } from 'redux-saga/effects';
import * as chatAPI from '../apis/chat';
import { MessageTuple } from '../../Components/Chat';

type Status = boolean | null | undefined; // True: 성공, False: 실패, null: 로딩중, undefined: 아직 안함.

interface ChatState {
  chatList: string[];
  chatSummary: string | null;
  chatStatus: Status; 
  error: AxiosError | null;
  constructGraph: {
    status: Status;
  },
  getGraph: {
    graph: any,
    status: Status,
  },
  superConcepts: {
    superConcepts: any,
    status: Status,
  },
  editGraphNode: {
    status: Status,
  },
  getGraphChatRoom: {
    graphChatRooms: any,
    status: Status,
  },
  createGraphChatRoom: {
    status: Status,
  },
  getGraphChatDetails: {
    chattingHistory: string | null,
    status: Status,
  },
  createNewGraphChatMsg: {
    status: Status,
  },
  postfuncCall: {
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
  },
  editGraphNode: {
    status: undefined,
  },
  getGraphChatRoom: {
    graphChatRooms: null,
    status: undefined,
  },
  createGraphChatRoom: {
    status: undefined,
  },
  getGraphChatDetails: {
    chattingHistory: null,
    status: undefined,
  },
  createNewGraphChatMsg: {
    status: undefined,
  },
  postfuncCall: {
    status: undefined,
  },
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
    getGraph: (state, action: PayloadAction<chatAPI.getGraphReqType>) => {
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
    editGraphNode: (state, action: PayloadAction<chatAPI.editGraphNodePutReqType>) => {
        state.editGraphNode.status = null;
    },
    editGraphNodeSuccess: (state, { payload }) => {
        state.editGraphNode.status = true;
    },
    editGraphNodeFailure: (state, { payload }) => {
        state.editGraphNode.status = false;
    },
    getGraphChatRooms: (state, action: PayloadAction<chatAPI.getGraphChatRoomsReqType>) => {
      state.getGraphChatRoom.status = null;
    },
    getGraphChatRoomsFailure: (state, { payload }) => {
        state.getGraphChatRoom.status = false;
        state.getGraphChatRoom.graphChatRooms = null;
    },
    getGraphChatRoomsSuccess: (state, { payload }) => {
      console.log(payload);
      state.getGraphChatRoom.status = true;
      state.getGraphChatRoom.graphChatRooms = payload.chats;
    }, 
    createNewGraphChatRooms: (state, action: PayloadAction<chatAPI.createNewGraphChatRoomsReqType>) => {
        state.createGraphChatRoom.status = null;
    },
    createNewGraphChatRoomsFailure: (state, { payload }) => {
        state.createGraphChatRoom.status = false;
    },
    createNewGraphChatRoomsSuccess: (state, { payload }) => {
        state.createGraphChatRoom.status = true;
    },
    postfuncCall: (state, action: PayloadAction<chatAPI.postFuncCallReqType>) => {
        state.postfuncCall.status = null;
    },
    postfuncCallFailure: (state, { payload }) => {
      state.postfuncCall.status = false;
    },
    postfuncCallSuccess: (state, { payload }) => {
      state.chatSummary = payload.summary;
      state.postfuncCall.status = true;
    },
    getGraphChatDetails: (state, action: PayloadAction<chatAPI.getGraphChatDetailsReqType>) => {
      state.getGraphChatDetails.status = null;
    },
    getGraphChatDetailsFailure: (state, { payload }) => {
        state.getGraphChatDetails.status = false;
        state.getGraphChatDetails.chattingHistory = null;
    },
    getGraphChatDetailsSuccess: (state, { payload }) => {
      console.log(payload)
        state.getGraphChatDetails.status = true;
        state.getGraphChatDetails.chattingHistory = payload.chat_history;
    },
    createNewGraphChatMsg: (state, action: PayloadAction<chatAPI.createNewGraphChatMsgReqType>) => {
      state.createNewGraphChatMsg.status = null;
    },
    createNewGraphChatMsgFailure: (state, { payload }) => {
        state.createNewGraphChatMsg.status = false;
    },
    createNewGraphChatMsgSuccess: (state, { payload }) => {
        state.createNewGraphChatMsg.status = true;
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
function* getGraphSaga(action: PayloadAction<chatAPI.getGraphReqType>) {
    try {
      const response: AxiosResponse = yield call(chatAPI.getGraph, action.payload);
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
function* editGraphNodeSaga(action: PayloadAction<chatAPI.editGraphNodePutReqType>) {
    try {
      const response: AxiosResponse = yield call(chatAPI.editGraphNode, action.payload);
      yield put(chatActions.editGraphNodeSuccess(response));
    } catch (error) {
      yield put(chatActions.editGraphNodeFailure(error));
    }
}
function* getGraphChatRoomsSaga(action: PayloadAction<chatAPI.getGraphChatRoomsReqType>) {
  try {
    const response: AxiosResponse = yield call(chatAPI.getGraphChatRooms, action.payload);
    yield put(chatActions.getGraphChatRoomsSuccess(response));
  } catch (error) {
    yield put(chatActions.getGraphChatRoomsFailure(error));
  }
}
function* createNewGraphChatRoomsSaga(action: PayloadAction<chatAPI.createNewGraphChatRoomsReqType>) {
  try {
    const response: AxiosResponse = yield call(chatAPI.createNewGraphChatRooms, action.payload);
    yield put(chatActions.createNewGraphChatRoomsSuccess(response));
  } catch (error) {
    yield put(chatActions.createNewGraphChatRoomsFailure(error));
  }
}
function* getGraphChatDetailsSaga(action: PayloadAction<chatAPI.getGraphChatDetailsReqType>) {
  try {
    const response: AxiosResponse = yield call(chatAPI.getGraphChatDetails, action.payload);
    yield put(chatActions.getGraphChatDetailsSuccess(response));
  } catch (error) {
    yield put(chatActions.getGraphChatDetailsFailure(error));
  }
}
function* createNewGraphChatMsgSaga(action: PayloadAction<chatAPI.createNewGraphChatMsgReqType>) {
  try {
    const response: AxiosResponse = yield call(chatAPI.createNewGraphChatMsg, action.payload);
    yield put(chatActions.createNewGraphChatMsgSuccess(response));
  } catch (error) {
    yield put(chatActions.createNewGraphChatMsgFailure(error));
  }
}
function* postfuncCallSaga(action: PayloadAction<chatAPI.postFuncCallReqType>) {
  try {
    const response: AxiosResponse = yield call(chatAPI.postfuncCall, action.payload);
    yield put(chatActions.postfuncCallSuccess(response));
  } catch (error) {
    yield put(chatActions.postfuncCallFailure(error));
  }
}

export default function* chatSaga() {
  yield takeLatest(chatActions.getChats, getChatsSaga);
  yield takeLatest(chatActions.getGraph, getGraphSaga);
  yield takeLatest(chatActions.getSuperConcept, getSuperConceptSaga);
  yield takeLatest(chatActions.sendNewMessage, sendNewMessageSaga);
  yield takeLatest(chatActions.createNewURL, createNewURLSaga);
  yield takeLatest(chatActions.constructGraph, constructGraphSaga);
  yield takeLatest(chatActions.editGraphNode, editGraphNodeSaga);
  yield takeLatest(chatActions.getGraphChatRooms, getGraphChatRoomsSaga);
  yield takeLatest(chatActions.createNewGraphChatRooms, createNewGraphChatRoomsSaga);
  yield takeLatest(chatActions.createNewGraphChatMsg, createNewGraphChatMsgSaga);
  yield takeLatest(chatActions.getGraphChatDetails, getGraphChatDetailsSaga);
  yield takeLatest(chatActions.postfuncCall, postfuncCallSaga);
}
