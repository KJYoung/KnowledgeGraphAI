import React from 'react';
import styled, { keyframes } from 'styled-components';

export type MessageTuple = [string, string];

interface ChatProps {
  messages: MessageTuple[];
  rev?: boolean;
}

const parseMessage = (message: string) => {
	// Replace **text** with <strong>text</strong>
	const boldReplaced = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
	// Replace newline characters with <br />
	const newlineReplaced = boldReplaced.split('\n').join('<br />');

	// Replace [text](url) with clickable links in blue color
	const urlPattern = /\[(.*?)\]\((https?:\/\/[^\s]+)\)/g;
  const processedMessage = newlineReplaced.replace(urlPattern, '<a href="$2" style="color: blue;" target="_blank">$1</a>');
	return processedMessage;
};

export const Chat: React.FC<ChatProps> = ({ messages, rev }) => {
  return (
    <ChatContainer>
      {messages.map((msg, index) => (
        <ChatBubble key={index} isUser={((index + (rev ? 1 : 0)) % 2 !== 0) }>
          <strong>{msg[0]}</strong>
          <br />
          <ChatSpan dangerouslySetInnerHTML={{ __html: parseMessage(msg[1]) }} />
        </ChatBubble>
      ))}
    </ChatContainer>
  );
};

const ChatSpan = styled.div`
    width: 100%;
    text-align: left;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
  max-height: 80vh;
`;

const bubbleAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ChatBubble = styled.div<{ isUser: boolean }>`
  background-color: ${({ isUser }) => (isUser ? '#d1e7dd' : '#fff3cd')};
  color: #333;
  padding: 10px 15px;
  border-radius: 15px;
  margin-bottom: 10px;
  max-width: 80%;
  align-self: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  animation: ${bubbleAnimation} 0.3s ease-out;

  strong {
    font-weight: bold;
    margin-bottom: 5px;
  }
`;
