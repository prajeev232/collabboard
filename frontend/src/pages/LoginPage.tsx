import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../api/auth";
import { ApiError } from "../api/http";
import { Alert, Button, Container, Stack, TextField, Typography } from "@mui/material";

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

            // IMPORTANT: send them back to where they came from
            nav(next, { replace: true });
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setError(err.body?.message ?? err.message);
            } else {
                setError("Login failed");
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Stack spacing={2}>
                <Typography variant="h5">Login</Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={busy}
                    fullWidth
                />

                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                    fullWidth
                />

                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={busy || !email.trim() || !password}
                >
                    {busy ? "Logging in..." : "Login"}
                </Button>

                <Typography variant="body2">
                    Don't have an account?{" "}
                    <Link to={`/register?next=${encodeURIComponent(next)}`}>Register</Link>
                </Typography>
            </Stack>
        </Container>
    );
};

export default LoginPage;
