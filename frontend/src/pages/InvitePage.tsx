import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import AppShellTemplate from "../components/templates/AppShellTemplate";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ApiError, getAccessToken } from "../api/http";
import { acceptInvite, getInvitePreview, type InvitePreviewResponse } from "../api/invites";

const InvitePage = () => {
  const { token } = useParams();
  const nav = useNavigate();
  const [search] = useSearchParams();

  const [data, setData] = useState<InvitePreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const next = search.get("next") ?? (token ? `/invite/${token}` : "/");

  useEffect(() => {
    if (!token) return;
    setError(null);

    (async () => {
      try {
        const res = await getInvitePreview(token);
        setData(res);
      } catch (e: unknown) {
        if (e instanceof ApiError) setError(e.body?.message ?? e.message);
        else setError("Failed to load invite");
      }
    })();
  }, [token]);

  const loggedIn = !!getAccessToken();

  const onLogin = () => {
    // preserve where to come back
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  };

  const onAccept = async () => {
    if (!token) return;
    setError(null);

    try {
      setBusy(true);
      const res = await acceptInvite(token);
      nav(`/boards/${res.boardId}`);
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        onLogin();
        return;
      }
      setError(e instanceof ApiError ? (e.body?.message ?? e.message) : "Failed to accept invite");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShellTemplate title="Invite">
      <Paper variant="outlined" sx={{ p: 2, maxWidth: 640 }}>
        <Typography variant="h5" fontWeight={900}>
          Board invite
        </Typography>

        {data && (
          <Stack spacing={0.75} sx={{ mt: 1.5 }}>
            <Typography>
              You were invited to <b>{data.boardName}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {data.role} • Invited email: {data.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Expires: {new Date(data.expiresAt).toLocaleString()}
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {!loggedIn ? (
            <Button variant="contained" onClick={onLogin}>
              Login to accept
            </Button>
          ) : (
            <Button variant="contained" onClick={onAccept} disabled={busy || !data}>
              {busy ? "Accepting..." : "Accept invite"}
            </Button>
          )}

          <Button variant="text" onClick={() => nav("/")}>
            Go home
          </Button>
        </Stack>
      </Paper>
    </AppShellTemplate>
  );
};

export default InvitePage;
