import { Box, Button, Stack, TextField } from "@mui/material";
import { useState } from "react";

type Props = {
  collapsedLabel: string;
  inputLabel: string;
  submitLabel?: string;
  initialValue?: string;
  onSubmit: (value: string) => Promise<void> | void;

  defaultOpen?: boolean;     // ✅ NEW
  onClose?: () => void;      // ✅ NEW (lets parent close popper too)
  disabled: boolean;
};

const InlineCreate = ({
  collapsedLabel,
  inputLabel,
  submitLabel = "Add",
  initialValue = "",
  onSubmit,
  defaultOpen = false,
  onClose,
  disabled
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  const handleSubmit = async () => {
    const v = value.trim();
    if (!v) return;

    try {
      setBusy(true);
      await onSubmit(v);
      setValue("");
      close();
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="text"
        onClick={() => setOpen(true)}
        sx={{ justifyContent: "flex-start", textTransform: "none", width: "100%", fontWeight: 700 }}
        disabled={disabled}
      >
        {collapsedLabel}
      </Button>
    );
  }

  return (
    <Box sx={{ bgcolor: "common.white", borderRadius: 2, p: 1.5, border: "1px solid", borderColor: "grey.300" }}>
      <Stack spacing={1}>
        <TextField
          autoFocus
          label={inputLabel}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="small"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") close();
          }}
        />
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={handleSubmit} disabled={busy}>
            {busy ? "Saving..." : submitLabel}
          </Button>
          <Button variant="text" onClick={close} disabled={busy}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default InlineCreate;
