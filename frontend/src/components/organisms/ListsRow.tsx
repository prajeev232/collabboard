// ListsRow.tsx
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMemo, useState } from "react";

type Props = {
  children: React.ReactNode;
  onAddList?: (payload: { name: string; wipLimit?: number | null }) => Promise<void> | void;
};

const ListsRow = ({ children, onAddList }: Props) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [wipLimitStr, setWipLimitStr] = useState("");
  const [busy, setBusy] = useState(false);

  const wipLimit = useMemo(() => {
    const t = wipLimitStr.trim();
    if (!t) return null;
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    return Math.floor(n);
  }, [wipLimitStr]);

  const close = () => {
    setOpen(false);
    setName("");
    setWipLimitStr("");
    setBusy(false);
  };

  const submit = async () => {
    if (!onAddList) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (wipLimit !== null && wipLimit <= 0) return;

    try {
      setBusy(true);
      await onAddList({ name: trimmed, wipLimit });
      close();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        gap: 2,
        alignItems: "stretch",
        overflowX: "auto",
        pb: 1,
        scrollSnapType: "x mandatory",
      }}
    >
      {children}

      {/* ✅ Add-list “tile” right next to the last list */}
      {onAddList && (
        <Box
          sx={{
            flex: "0 0 auto",
            width: 56,
            scrollSnapAlign: "start",
            display: "flex",
            justifyContent: "center",
            pt: 1.5,
          }}
        >
          <Stack spacing={1} alignItems="center">
            <IconButton
              onClick={() => setOpen(true)}
              size="small"
              sx={{
                bgcolor: "common.white",
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 1.5,
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>

            <Typography variant="caption" color="text.secondary">
              Add
            </Typography>
          </Stack>

          {/* Dialog */}
          <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
            <DialogTitle>Create list</DialogTitle>

            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  autoFocus
                  label="List name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                    if (e.key === "Escape") close();
                  }}
                />

                <TextField
                  label="WIP limit (optional)"
                  value={wipLimitStr}
                  onChange={(e) => setWipLimitStr(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 5"
                  helperText={
                    wipLimitStr.trim() && (wipLimit === null || wipLimit <= 0)
                      ? "Must be a positive number"
                      : "Leave empty for no limit."
                  }
                  error={!!wipLimitStr.trim() && (wipLimit === null || wipLimit <= 0)}
                />
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={close} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={submit}
                disabled={busy || !name.trim() || (!!wipLimitStr.trim() && (wipLimit === null || wipLimit <= 0))}
              >
                {busy ? "Creating..." : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
};

export default ListsRow;
