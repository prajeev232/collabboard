import { Box, Paper, Stack, Typography, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";

type Props = {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children?: ReactNode;
  listId?: string; // pass only for real lists; omit for "Add list"

  // ✅ NEW
  canDelete?: boolean;
  onDelete?: (listId: string) => void;
};

const ListColumn = ({ title, subtitle, headerRight, children, listId, canDelete = false, onDelete }: Props) => {
  const droppable = listId ? useDroppable({ id: `list:${listId}`, data: { type: "LIST", listId } }) : null;

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const showMenu = Boolean(listId && canDelete && onDelete);

  const closeMenu = () => setMenuAnchor(null);

  const onClickDelete = () => {
    closeMenu();
    setConfirmOpen(true);
  };

  const confirmTitle = useMemo(() => {
    // avoid huge titles in dialog header
    const t = title.trim();
    if (!t) return "this list";
    return t.length > 40 ? `${t.slice(0, 40)}…` : t;
  }, [title]);

  return (
    <Paper
      ref={droppable?.setNodeRef}
      variant="outlined"
      sx={{
        width: 320,
        flex: "0 0 auto",
        p: 1.5,
        height: "100%",
        borderRadius: 0,
        bgcolor: "grey.50",
        scrollSnapAlign: "start",
        outline: droppable?.isOver ? "2px solid" : "none",
        outlineColor: droppable?.isOver ? "primary.main" : undefined,
      }}
    >
      {/* Header */}
      <Box sx={{ px: 0.5, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontWeight={800} sx={{ flex: 1, minWidth: 0 }} noWrap>
            {title}
          </Typography>

          {/* existing headerRight content (if any) */}
          {headerRight}

          {/* ✅ list actions */}
          {showMenu && (
            <>
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>

              <Menu anchorEl={menuAnchor} open={menuOpen} onClose={closeMenu}>
                <MenuItem onClick={onClickDelete} sx={{ color: "error.main", fontWeight: 700 }}>
                  Delete list
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>

        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Body */}
      <Box
        sx={{
          maxHeight: "calc(100vh - 220px)",
          overflowY: "auto",
          pr: 0.5,
        }}
      >
        <Stack spacing={1}>{children}</Stack>
      </Box>

      {/* ✅ Confirm delete */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete list?</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            This will permanently delete <b>{confirmTitle}</b> and all cards inside it.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (!listId || !onDelete) return;
              setConfirmOpen(false);
              onDelete(listId);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ListColumn;
