import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { BoardMemberResponse, BoardRole } from "../../api/members";
import { listBoardMembers, removeBoardMember, updateBoardMemberRole } from "../../api/members";
import { getApiErrorMessage } from "../../api/errors";

type Props = {
  boardId: string;
  myRole: BoardRole | null;
  onToast: (msg: string) => void;
};

const roleChipColor = (r: BoardRole): "default" | "warning" | "error" => {
  switch (r) {
    case "OWNER":
      return "error";
    case "EDITOR":
      return "warning";
    case "VIEWER":
      return "default";
  }
};

const BoardMembersPanel = ({ boardId, myRole, onToast }: Props) => {
  const [members, setMembers] = useState<BoardMemberResponse[]>([]);
  const [busy, setBusy] = useState(false);

  const isOwner = myRole === "OWNER";

  const sorted = useMemo(() => {
    return [...members].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  }, [members]);

  const load = async () => {
    try {
      const res = await listBoardMembers(boardId);
      setMembers(res);
    } catch (e: any) {
      onToast(getApiErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const handleRoleChange = async (userId: string, role: "EDITOR" | "VIEWER") => {
    try {
      setBusy(true);
      await updateBoardMemberRole(boardId, userId, { role });
      await load();
      onToast("Member role updated");
    } catch (e: any) {
      onToast(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      setBusy(true);
      await removeBoardMember(boardId, userId);
      await load();
      onToast("Member removed");
    } catch (e: any) {
      onToast(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography fontWeight={800}>Members</Typography>
        <Button variant="text" onClick={load} disabled={busy}>
          Refresh
        </Button>
      </Stack>

      <Stack spacing={1}>
        {sorted.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No members found.
          </Typography>
        ) : (
          sorted.map((m) => (
            <Box
              key={m.userId}
              sx={{
                p: 1.25,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "common.white",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>
                    {m.displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {m.email}
                  </Typography>
                </Box>

                <Chip size="small" label={m.role} color={roleChipColor(m.role)} variant="outlined" />

                {isOwner && m.role !== "OWNER" ? (
                  <>
                    <TextField
                      select
                      size="small"
                      label="Role"
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.userId, e.target.value as "EDITOR" | "VIEWER")}
                      disabled={busy}
                      sx={{ width: 140 }}
                    >
                      <MenuItem value="EDITOR">EDITOR</MenuItem>
                      <MenuItem value="VIEWER">VIEWER</MenuItem>
                    </TextField>

                    <IconButton
                      aria-label="remove member"
                      onClick={() => handleRemove(m.userId)}
                      disabled={busy}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                ) : null}
              </Stack>
            </Box>
          ))
        )}
      </Stack>
    </Paper>
  );
};

export default BoardMembersPanel;
