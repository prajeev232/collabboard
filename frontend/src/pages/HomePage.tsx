import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AppShellTemplate from "../components/templates/AppShellTemplate";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { type BoardResponse, createBoard, listBoards } from "../api/boards";
import { ApiError } from "../api/http";

const HomePage = () => {
  const nav = useNavigate();

  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [newBoardName, setNewBoardName] = useState("My board");

  const [tab, setTab] = useState<0 | 1>(0); // 0: boards, 1: create
  const [query, setQuery] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError(null);
    try {
      setBusy(true);
      const res = await listBoards();
      setBoards(res);
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(e instanceof ApiError ? (e.body?.message ?? e.message) : "Failed to load boards");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return boards;

    return boards.filter((b) => {
      return (
        b.name.toLowerCase().includes(q) ||
        (b.ownerName ?? "").toLowerCase().includes(q)
      );
    });
  }, [boards, query]);

  const onCreate = async () => {
    setError(null);
    const name = newBoardName.trim();
    if (!name) {
      setError("Board name is required");
      return;
    }

    try {
      setBusy(true);
      const board = await createBoard(name);

      // optimistic: show immediately
      setBoards((prev) => [board, ...prev]);
      setNewBoardName("My board");

      // bounce user to the board
      nav(`/boards/${board.id}`);
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(e instanceof ApiError ? (e.body?.message ?? e.message) : "Failed to create board.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShellTemplate title="CollabBoard">
      <Box sx={{ maxWidth: 980, mx: "auto", my: "auto", width: "100%" }}>
        <Stack spacing={0.75} sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={900}>
            Boards
          </Typography>
          <Typography color="text.secondary">Jump back in, or create a new board.</Typography>
        </Stack>

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ px: 2, pt: 1.5 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 44 }}>
              <Tab label="My boards" sx={{ textTransform: "none", fontWeight: 800 }} />
              <Tab label="Create board" sx={{ textTransform: "none", fontWeight: 800 }} />
            </Tabs>
          </Box>

          <Divider />

          {/* Tab content */}
          <Box sx={{ p: 2 }}>
            {tab === 0 && (
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems="stretch">
                  <TextField
                    label="Search boards"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or owner…"
                    fullWidth
                  />

                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      onClick={() => setTab(1)}
                      sx={{ fontWeight: 800, textTransform: "none", whiteSpace: "nowrap" }}
                    >
                      New board
                    </Button>
                  </Box>
                </Stack>

                {boards.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "grey.50" }}>
                    <Typography fontWeight={900}>No boards yet</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      Create your first board to start organizing work.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setTab(1)}
                      sx={{ mt: 2, fontWeight: 800, textTransform: "none" }}
                    >
                      Create a board
                    </Button>
                  </Paper>
                ) : (
                  <Stack spacing={1}>
                    {filtered.map((b) => (
                      <Paper
                        key={b.id}
                        variant="outlined"
                        component={Link}
                        to={`/boards/${b.id}`}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          textDecoration: "none",
                          color: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            boxShadow: 2,
                            transform: "translateY(-1px)",
                            bgcolor: "grey.50",
                          },
                        }}
                      >
                        {/* Left: board info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={900} noWrap>
                            {b.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            Owner: {b.ownerName ?? "—"}
                          </Typography>
                        </Box>

                        {/* Right: action */}
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ fontWeight: 800, textTransform: "none", whiteSpace: "nowrap" }}
                        >
                          Open
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}

            {tab === 1 && (
              <Box sx={{ maxWidth: 560 }}>
                <Typography fontWeight={900} sx={{ mb: 0.5 }}>
                  Create a new board
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Give it a clear name — you can rename it later.
                </Typography>

                <Stack spacing={1.5}>
                  <TextField
                    label="Board name"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onCreate();
                    }}
                    fullWidth
                    disabled={busy}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={onCreate}
                      disabled={busy || !newBoardName.trim()}
                      sx={{ fontWeight: 800, textTransform: "none" }}
                    >
                      {busy ? "Creating..." : "Create board"}
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => setTab(0)}
                      sx={{ fontWeight: 800, textTransform: "none" }}
                    >
                      Back to boards
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Paper>
      </Box>
    </AppShellTemplate>
  );
};

export default HomePage;
