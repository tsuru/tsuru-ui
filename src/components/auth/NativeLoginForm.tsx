import { FormEvent, FunctionComponent, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { ReactComponent as TsuruLogo } from "../base/logo.svg";
import config from "../../config";

type NativeLoginFormProps = {
  // Rejects with the reason the tsuru API gave, which is what the form shows.
  onSubmit: (email: string, password: string) => Promise<void>;

  // Shown above the fields, e.g. when a stored token was already rejected.
  notice?: string;
};

// The only screen rendered before there is a session, so it brings its own
// CssBaseline: the app's one lives inside the authenticated tree.
const NativeLoginForm: FunctionComponent<NativeLoginFormProps> = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      await props.onSubmit(email, password);
    } catch (e) {
      // Only on failure: a successful login unmounts this form, and setting
      // state afterwards would be an update on an unmounted component.
      setError(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{ p: 4, width: "100%", maxWidth: 420, borderRadius: 2 }}
        >
          <Box
            component="form"
            onSubmit={submit}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <Box sx={{ color: "primary.main" }}>
                <TsuruLogo viewBox="0 0 240 40" width="140" />
              </Box>
              <Typography variant="h6" component="h1">
                Sign in
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {config.server}
              </Typography>
            </Stack>

            {props.notice && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {props.notice}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              fullWidth
              margin="normal"
              disabled={submitting}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              fullWidth
              margin="normal"
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="contained"
              disableElevation
              fullWidth
              sx={{ mt: 3, textTransform: "none" }}
              disabled={submitting || email === "" || password === ""}
              startIcon={
                submitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default NativeLoginForm;
