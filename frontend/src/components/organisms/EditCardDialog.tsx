import { useEffect, useState } from "react";
import type { Card } from "../../features/board/types";
import type { CardPriority } from "../../api/cards";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  card: Card | null;
  onClose: () => void;
  canEdit: boolean;

  members: { userId: string; displayName: string | null; email: string }[]; // ✅ NEW
  onSave: (payload: {
    title: string;
    description: string;
    priority: CardPriority;
    dueDate: string | null;
    expectedVersion: number;
    assigneeUserId: string | null; // ✅ NEW
  }) => Promise<void>;
};

const toDateInputValue = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // yyyy-mm-dd in local time
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const dateInputToIso = (value: string): string | null => {
  if (!value) return null;
  // interpret as local date at 23:59:59 to avoid "due date is previous day" issues in some timezones
  const d = new Date(`${value}T23:59:59`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const EditCardDialog = ({ open, card, onClose, onSave, canEdit, members }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CardPriority>("MEDIUM");
  const [dueDateInput, setDueDateInput] = useState(""); // yyyy-mm-dd
  const [busy, setBusy] = useState(false);
  const [assigneeUserId, setAssigneeUserId] = useState<string | "">("");
  
  useEffect(() => {
    if (!open) return;

    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
    setPriority((card?.priority ?? "MEDIUM") as CardPriority);
    setDueDateInput(toDateInputValue(card?.dueDate ?? null));
    setBusy(false);
    setAssigneeUserId(card?.assigneeUserId ?? "");
  }, [open, card?.id]);

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const handleSave = async () => {
    if (!card) return;

    const t = title.trim();
    if (!t) return;

    try {
      setBusy(true);
      await onSave({
        title: t,
        description,
        priority,
        dueDate: dateInputToIso(dueDateInput),
        expectedVersion: card.version,
        assigneeUserId: assigneeUserId === "" ? null : assigneeUserId,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Card</DialogTitle>
      <Divider />

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            fullWidth
            disabled={!canEdit || busy}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={4}
            fullWidth
            disabled={busy}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as CardPriority)}
              fullWidth
              disabled={busy}
            >
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
            </TextField>

            <TextField
              label="Due date"
              type="date"
              value={dueDateInput}
              onChange={(e) => setDueDateInput(e.target.value)}
              fullWidth
              disabled={busy}
              InputLabelProps={{ shrink: true }}
              helperText="Optional"
            />
            
            <TextField
              select
              label="Assignee (optional)"
              value={assigneeUserId}
              onChange={(e) => setAssigneeUserId(e.target.value)}
              fullWidth
              disabled={busy}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {members.map((m) => (
                <MenuItem key={m.userId} value={m.userId}>
                  {(m.displayName && m.displayName.trim()) ? m.displayName : m.email}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            {card ? `Version: ${card.version} • Updated: ${card.updatedAt}` : ""}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={busy}>
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSave} disabled={busy || !title.trim()}>
          {busy ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCardDialog;
