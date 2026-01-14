import { useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography, Chip } from "@mui/material";
import { createInvite, listInvites, type InviteRole, type InviteListResponse } from "../../api/invites";
import { getApiErrorMessage } from "../../api/errors";

type Props = {
  boardId: string;
  onToast: (msg: string) => void;
};

const BoardInvitesPanel = ({ boardId, onToast }: Props) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("EDITOR");
  const [busy, setBusy] = useState(false);
  const [invites, setInvites] = useState<InviteListResponse[]>([]);

  const load = async () => {
    try {
      const res = await listInvites(boardId, "PENDING");
      setInvites(res);
    } catch (e: any) {
      onToast(getApiErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const submit = async () => {
    const v = email.trim();
    if (!v) return;

    try {
      setBusy(true);
      await createInvite(boardId, { email: v, role });
      setEmail("");
      await load();
      onToast("Invite created");
    } catch (e: any) {
      onToast(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
      <Typography fontWeight={800} sx={{ mb: 1 }}>
        Invites (Owner only)
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          disabled={busy}
        />
        <TextField
          select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as InviteRole)}
          disabled={busy}
          sx={{ width: { xs: "100%", sm: 160 } }}
        >
          <MenuItem value="EDITOR">EDITOR</MenuItem>
          <MenuItem value="VIEWER">VIEWER</MenuItem>
        </TextField>
        <Button variant="contained" onClick={submit} disabled={busy || !email.trim()}>
          {busy ? "Sending..." : "Invite"}
        </Button>
      </Stack>

      <Typography fontWeight={700} sx={{ mb: 1 }}>
        Pending invites
      </Typography>

      <Stack spacing={1}>
        {invites.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No pending invites.
          </Typography>
        ) : (
          invites.map((inv) => (
            <Box
              key={inv.id}
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
                    {inv.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Expires: {new Date(inv.expiresAt).toLocaleString()}
                  </Typography>
                </Box>

                <Chip size="small" label={inv.role} variant="outlined" />
                <Chip size="small" label={inv.status} />
              </Stack>
            </Box>
          ))
        )}
      </Stack>
    </Paper>
  );
};

export default BoardInvitesPanel;
