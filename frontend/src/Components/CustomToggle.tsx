// Used in EvidentialSemanticMapping.tsx
import React from 'react';
import styled from 'styled-components';


interface ToggleButtonProps {
  toggleState: boolean, 
  onText: string;
  offText: string;
  onToggle: () => void;
  width?: string;
}

export const CustomToggle: React.FC<ToggleButtonProps> = ({ toggleState, onText, offText, onToggle, width }) => {
  const handleClick = () => {
    onToggle();
  };

  return (
    <ToggleButtonContainer onClick={handleClick} isOn={toggleState} width={width}>
      <ToggleButtonCircle isOn={toggleState}>
        {toggleState ? onText : offText}
      </ToggleButtonCircle>
    </ToggleButtonContainer>
  );
};

interface ToggleButtonContainerProps {
  isOn: boolean;
  width?: string;
}

const ToggleButtonContainer = styled.div<ToggleButtonContainerProps>`
  display: inline-flex;
  width: ${({ width = '130px' }) => width};
  align-items: center;
  justify-content: space-between;
  padding: 4px;
  border-radius: 16px;
  background-color: ${props => (props.isOn ? 'var(--youtube-mode-one)' : 'var(--youtube-mode-two)')};
  color: black;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
`;

interface ToggleButtonCircleProps {
  isOn: boolean;
}

const ToggleButtonCircle = styled.div<ToggleButtonCircleProps>`
  border-radius: 16px;
  background-color: #fff;
  display: inline-block;
  padding: 4px 8px;
  transition: transform 0.4s ease;
  transform: translateX(${props => (props.isOn ? '100%' : '0')});
  white-space: nowrap; /* Prevent text wrapping */
  overflow: hidden; /* Hide overflowed text */
`;
