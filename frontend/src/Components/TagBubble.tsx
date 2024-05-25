// From SWPP Project. KJYOUNG copyright.
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { getContrastYIQ } from '../utils/Color';
import { BasicDIV } from './Basics';

interface IPropsTagBubbleX {
  testId?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const TagBubbleX = ({ testId, onClick }: IPropsTagBubbleX) => (
  <TagBubbleXstyle data-testid={testId} onClick={onClick}>
    <FontAwesomeIcon icon={faX} />
  </TagBubbleXstyle>
);

export const TagBubbleXstyle = styled.div`
  margin-left: 5px;
  font-size: 10px;
  color: red;
  width: fit-content;
  height: fit-content;
  display: block;
  cursor: pointer;
`;

export const TagBubble = styled(BasicDIV)`
  height: ${({ isPrime }) => isPrime ? '24px' : '20px'}; ;
  width: fit-content;
  border-radius: 25px;
  border: none;
  white-space: nowrap;
  text-align: center;
  vertical-align: center;
  display: flex;
  align-items: center;

  margin: ${({ margin = '1px 3px' }) => margin};
  margin-left: ${({ marginLeft }) => marginLeft};
  margin-right: ${({ marginRight }) => marginRight};
  margin-top: ${({ marginTop }) => marginTop};
  margin-bottom: ${({ marginBottom }) => marginBottom};
  
  padding: ${({ padding = '1px 12px' }) => padding};
  padding-left: ${({ paddingLeft }) => paddingLeft};
  padding-right: ${({ paddingRight }) => paddingRight};
  padding-top: ${({ paddingTop }) => paddingTop};
  padding-bottom: ${({ paddingBottom }) => paddingBottom};

  ${({ color }) =>
    color &&
    `
      background: ${color};
      color: ${getContrastYIQ(color)};
    `}
  ${({ isPrime }) =>
    isPrime &&
    `
      border: 2px solid black;
    `}
`;
