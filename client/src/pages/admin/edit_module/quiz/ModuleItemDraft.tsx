import React, { ReactNode } from "react";
import styled from "styled-components";
import { Card, CardActions, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Draggable } from "react-beautiful-dnd";

const StyledDragHandle = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  background: #7f7f7f;
  background: ${({ theme }) => theme.palette.grey["200"]};

  svg {
    transform: rotate(90deg);
  }
`;

interface QuizItemDraftProps {
  itemId: number;
  index: number;
  children: ReactNode;
  onRemove: () => void;
  extraActions?: ReactNode;
}

export default function ModuleItemDraft({
  itemId,
  index,
  children,
  onRemove,
  extraActions,
}: QuizItemDraftProps) {
  return (
    <Draggable draggableId={itemId + ""} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          elevation={4}
          sx={{ display: "flex", mb: 4, flexFlow: "column nowrap" }}
        >
          <StyledDragHandle {...provided.dragHandleProps}>
            <DragIndicatorIcon />
          </StyledDragHandle>

          {children}

          <CardActions>
            <IconButton aria-label="Delete" onClick={onRemove}>
              <DeleteOutlineIcon />
            </IconButton>
            {extraActions}
          </CardActions>
        </Card>
      )}
    </Draggable>
  );
}