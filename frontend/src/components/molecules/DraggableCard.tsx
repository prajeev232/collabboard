import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Box, IconButton } from "@mui/material";
import CardPreview from "./CardPreview";
import type { CardPriority } from "../../api/cards";
import { red } from "@mui/material/colors";

type Props = {
  cardId: string;
  listId: string;
  title: string;
  description?: string;
  priority?: CardPriority;
  dueDate?: string | null;
  onClick?: () => void;
};

const DraggableCard = ({ cardId, listId, title, description, priority, dueDate, onClick }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cardId,
    data: { type: "CARD", cardId, listId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    color: "red"
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ position: "relative" }}>
      <IconButton
        size="small"
        {...attributes}
        {...listeners}
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          zIndex: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          "&:hover": { bgcolor: "grey.100" },
          cursor: "grab",
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>

      <CardPreview
        title={title}
        description={description}
        priority={priority}
        dueDate={dueDate}
        onClick={onClick}
      />
    </Box>
  );
};

export default DraggableCard;
