import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../api/auth";
import { ApiError } from "../api/http";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

const LoginPage = () => {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();

    const next = searchParams.get("next") ?? "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async () => {
        setError(null);
        const e = email.trim().toLowerCase();
        if (!e || !password) return;

        try {
            setBusy(true);
            await login({ email: e, password });
            nav(next, { replace: true });
        } catch (err: unknown) {
            if (err instanceof ApiError) setError(err.body?.message ?? err.message);
            else setError("Login failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                px: 2,
                background: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(16,185,129,0.08))",
            }}
        >
            <Container maxWidth="sm">
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                    }}
                >
                    {/* Top brand header */}
                    <Box
                        sx={{
                            px: 4,
                            py: 3,
                            background: "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(16,185,129,0.12))",
                        }}
                    >
                        <Stack spacing={0.5}>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                                CollabBoard
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Real-time collaborative kanban boards — stay in sync with your team.
                            </Typography>
                        </Stack>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        <Stack spacing={2.2}>
                            <Stack spacing={0.5}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Welcome back
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Log in to continue to your boards.
                                </Typography>
                            </Stack>

                            {error && <Alert severity="error">{error}</Alert>}

                            <TextField
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={busy}
                                fullWidth
                                autoComplete="email"
                            />

                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={busy}
                                fullWidth
                                autoComplete="current-password"
                            />

                            <Button
                                variant="contained"
                                onClick={onSubmit}
                                disabled={busy || !email.trim() || !password}
                                size="large"
                                sx={{
                                    py: 1.2,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 800,

                                    // ✅ Solid color (no blending)
                                    bgcolor: "#6366F1",
                                    boxShadow: "0 12px 28px rgba(99,102,241,0.25)",

                                    "&:hover": {
                                        bgcolor: "#5458E8",
                                        boxShadow: "0 16px 34px rgba(99,102,241,0.32)",
                                    },
                                    "&:active": {
                                        transform: "translateY(1px)",
                                        boxShadow: "0 10px 22px rgba(99,102,241,0.22)",
                                    },
                                }}
                            >
                                {busy ? "Logging in..." : "Login"}
                            </Button>

                            <Divider />

                            <Typography variant="body2" color="text.secondary">
                                Don&apos;t have an account?{" "}
                                <Link to={`/register?next=${encodeURIComponent(next)}`}>Register</Link>
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "center", mt: 2 }}
                >
                    Tip: use the same account across devices — updates sync in real time.
                </Typography>
            </Container>
        </Box>
    );
};

export default LoginPage;
