import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { register, login } from "../api/auth";
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

export const RegisterPage = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const next = searchParams.get("next") ?? "/";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);

    const e = email.trim().toLowerCase();
    const p = password;

    if (!e || !p) return;

    try {
      setBusy(true);

      await register({
        email: e,
        password: p,
        displayName: displayName.trim() || null,
      });

      await login({ email: e, password: p });
      nav(next, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) setError(err.body?.message ?? err.body?.code ?? err.message);
      else setError("Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = !!email.trim() && password.length >= 8 && !busy;

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
          {/* Brand header */}
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
                Create an account and start collaborating in real time.
              </Typography>
            </Stack>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.2}>
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Create your account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  It only takes a minute.
                </Typography>
              </Stack>

              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Display name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={busy}
                fullWidth
                autoComplete="nickname"
              />

              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                fullWidth
                autoComplete="email"
              />

              <TextField
                label="Password (min 8 chars)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                fullWidth
                autoComplete="new-password"
                helperText={password.length > 0 && password.length < 8 ? "Must be at least 8 characters" : " "}
              />

              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={!canSubmit}
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
                {busy ? "Creating..." : "Create account"}
              </Button>

              <Divider />

              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link to={`/login?next=${encodeURIComponent(next)}`}>Login</Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center", mt: 2 }}
        >
          You can change your display name later from settings.
        </Typography>
      </Container>
    </Box>
  );
};

export default RegisterPage;
