import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import styled from 'styled-components';

interface ListViewProps {
  items: string[];
  currentItem: string;
  onItemClick: (item: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ items, currentItem, onItemClick }) => {
  return (
    <List>
      {items.map((item, index) => (
        <StyledListItem 
          key={index} 
          onClick={() => onItemClick(item)}
          isSelected={item === currentItem}
        >
          <ListItemText primary={item} />
        </StyledListItem>
      ))}
    </List>
  );
};

// Styled component for ListItem with conditional styling
const StyledListItem = styled(({ isSelected, ...rest } : any) => <ListItem {...rest} />)`
  cursor: pointer;
  background-color: ${({ isSelected }) => (isSelected ? '#f0f0f0' : 'inherit')};
  color: ${({ isSelected }) => (isSelected ? 'blue' : 'inherit')};
  &:hover {
    background-color: #e0e0e0;
  }
`;
