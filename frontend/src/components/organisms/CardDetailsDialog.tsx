import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { Card } from "../../features/board/types";

type Props = {
  open: boolean;
  card: Card | null;
  canEdit: boolean;

  listName?: string | null;

  createdByName: string;
  assigneeName: string | null;

  onClose: () => void;
  onEdit: () => void;

  onDelete?: () => void; // ✅ NEW
};

const fmtDue = (iso: string | null) => {
  if (!iso) return "None";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString();
};

const CardDetailsDialog = ({
  open,
  card,
  canEdit,
  listName,
  createdByName,
  assigneeName,
  onClose,
  onEdit,
  onDelete, // ✅ NEW
}: Props) => {
  const canDelete = !!card && canEdit && !!onDelete;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Card details</DialogTitle>
      <Divider />

      <DialogContent>
        {!card ? null : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Title
              </Typography>
              <Typography fontWeight={900} sx={{ wordBreak: "break-word" }}>
                {card.title}
              </Typography>
            </Box>

            <Box>
              <Typography variant="overline" color="text.secondary">
                Description
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {card.description?.trim() ? card.description : "—"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap" }}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  List
                </Typography>
                <Typography>{listName ?? "—"}</Typography>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">
                  Priority
                </Typography>
                <Typography>{card.priority}</Typography>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">
                  Due
                </Typography>
                <Typography>{fmtDue(card.dueDate)}</Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap" }}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Created by
                </Typography>
                <Typography>{createdByName}</Typography>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">
                  Assigned to
                </Typography>
                <Typography>{assigneeName ?? "Unassigned"}</Typography>
              </Box>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Version: {card.version} • Updated: {card.updatedAt}
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>

        {canEdit && (
          <Button
            color="error"
            variant="outlined"
            onClick={onDelete}
            disabled={!canDelete}
          >
            Delete
          </Button>
        )}

        <Button variant="contained" onClick={onEdit} disabled={!card || !canEdit}>
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CardDetailsDialog;
