import { useEffect, useState } from "react";
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
  onClose: () => void;
  canEdit: boolean;

  members: { userId: string; displayName: string | null; email: string }[];

  // matches CreateCardRequest shape you already have
  onCreate: (payload: {
    title: string;
    description: string;
    priority: CardPriority;
    dueDate: string | null;
    assigneeUserId: string | null;
  }) => Promise<void>;
};

const toDateInputValue = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const dateInputToIso = (value: string): string | null => {
  if (!value) return null;
  const d = new Date(`${value}T23:59:59`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const CreateCardDialog = ({ open, onClose, onCreate, canEdit, members }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CardPriority>("MEDIUM");
  const [dueDateInput, setDueDateInput] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState<string | "">("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;

    // defaults for create
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDateInput(toDateInputValue(null));
    setAssigneeUserId("");
    setBusy(false);
  }, [open]);

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const handleCreate = async () => {
    const t = title.trim();
    if (!t) return;

    try {
      setBusy(true);
      await onCreate({
        title: t,
        description,
        priority,
        dueDate: dateInputToIso(dueDateInput),
        assigneeUserId: assigneeUserId === "" ? null : assigneeUserId,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Card</DialogTitle>
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
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") handleClose();
            }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={4}
            fullWidth
            disabled={!canEdit || busy}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as CardPriority)}
              fullWidth
              disabled={!canEdit || busy}
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
              disabled={!canEdit || busy}
              InputLabelProps={{ shrink: true }}
              helperText="Optional"
            />

            <TextField
              select
              label="Assignee (optional)"
              value={assigneeUserId}
              onChange={(e) => setAssigneeUserId(e.target.value)}
              fullWidth
              disabled={!canEdit || busy}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {members.map((m) => (
                <MenuItem key={m.userId} value={m.userId}>
                  {m.displayName && m.displayName.trim() ? m.displayName : m.email}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            You can edit details later.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={busy}>
          Cancel
        </Button>

        <Button variant="contained" onClick={handleCreate} disabled={!canEdit || busy || !title.trim()}>
          {busy ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCardDialog;
