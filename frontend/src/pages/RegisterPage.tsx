import { useState } from "react";
import { Button, Container, Stack, TextField, Typography, Alert } from "@mui/material";
import { register, login } from "../api/auth";
import { ApiError } from "../api/http";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

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

      // auto login after registering.
      await login({ email: e, password: p });
      
      nav(next, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.body?.message ?? err.body?.code ?? err.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Register</Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Display name (optional)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={busy}
          fullWidth
        />

        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          fullWidth
        />

        <TextField
          label="Password (min 8 chars)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={busy || !email.trim() || password.length < 8}
        >
          {busy ? "Creating..." : "Create account"}
        </Button>

        <Typography variant="body2">
          Already have an account?{" "}
          <Link to={`/login?next=${encodeURIComponent(next)}`}>Login</Link>
        </Typography>
      </Stack>
    </Container>
  );
};

export default RegisterPage;
