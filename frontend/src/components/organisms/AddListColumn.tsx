import { Box, ClickAwayListener, IconButton, Paper, Popper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRef, useState } from "react";
import InlineCreate from "../molecules/InlineCreate";

type Props = {
  onSubmit: (name: string) => Promise<void> | void;
};

const AddListColumn = ({ onSubmit }: Props) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ flex: "0 0 auto" }}>
        <IconButton
          ref={anchorRef}
          onClick={() => setOpen((v) => !v)}
          size="small"
          sx={{
            border: "1px solid",
            borderColor: "grey.300",
            bgcolor: "common.white",
            borderRadius: 1.5,
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>

        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="left-start" // ✅ opens to the left (won’t cover last column as badly)
          modifiers={[
            { name: "offset", options: { offset: [0, 8] } }, // [skid, distance]
            { name: "preventOverflow", options: { boundary: "viewport", padding: 8 } },
            { name: "flip", options: { fallbackPlacements: ["bottom-start", "top-start"] } },
          ]}
          sx={{ zIndex: 2000 }}
        >
          <Paper
            variant="outlined"
            sx={{
              width: 320,
              p: 1.25,
              borderRadius: 2,
              bgcolor: "grey.50",
            }}
          >
            <InlineCreate
              collapsedLabel=""
              inputLabel="List name"
              submitLabel="Add list"
              defaultOpen
              onClose={() => setOpen(false)}
              onSubmit={async (v) => {
                await onSubmit(v);
                setOpen(false);
              }}
              disabled={false}
            />
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default AddListColumn;
