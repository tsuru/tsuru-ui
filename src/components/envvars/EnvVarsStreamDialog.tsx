import { FunctionComponent, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  alpha,
  useTheme,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircleOutline,
  ErrorOutline,
  Settings,
} from "@mui/icons-material";
import Console from "../base/Console";

export type StreamOperation = "add" | "edit" | "delete";

type EnvVarsStreamDialogProps = {
  open: boolean;
  operation: StreamOperation;
  variableName: string;
  stream: string;
  loading: boolean;
  error: Error | null;
  success: boolean;
  onClose: () => void;
};

const getOperationText = (
  operation: StreamOperation
): { title: string; action: string; past: string } => {
  switch (operation) {
    case "add":
      return { title: "Adding Variable", action: "Adding", past: "added" };
    case "edit":
      return {
        title: "Updating Variable",
        action: "Updating",
        past: "updated",
      };
    case "delete":
      return {
        title: "Deleting Variable",
        action: "Deleting",
        past: "deleted",
      };
  }
};

const EnvVarsStreamDialog: FunctionComponent<EnvVarsStreamDialogProps> = ({
  open,
  operation,
  variableName,
  stream,
  loading,
  error,
  success,
  onClose,
}) => {
  const theme = useTheme();
  const operationText = getOperationText(operation);
  const consoleBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleBoxRef.current) {
      consoleBoxRef.current.scrollTop = consoleBoxRef.current.scrollHeight;
    }
  }, [stream]);

  return (
    <Dialog
      open={open}
      onClose={success || error ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 300,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: loading
            ? alpha(theme.palette.primary.main, 0.05)
            : success
            ? alpha(theme.palette.success.main, 0.05)
            : alpha(theme.palette.error.main, 0.05),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {loading && (
          <Settings
            sx={{
              color: theme.palette.primary.main,
              animation: "spin 2s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
        )}
        {success && (
          <CheckCircleOutline sx={{ color: theme.palette.success.main }} />
        )}
        {error && <ErrorOutline sx={{ color: theme.palette.error.main }} />}
        <Typography variant="h6" component="span">
          {loading
            ? `${operationText.action} "${variableName}"...`
            : success
            ? `Variable ${operationText.past} successfully`
            : `Failed to ${operation} variable`}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {operation === "delete"
                ? "Removing environment variable and restarting application..."
                : "Setting environment variable and restarting application..."}
            </Typography>
          </Box>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              The environment variable <strong>{variableName}</strong> has been{" "}
              {operationText.past} successfully.
              {stream && " The application is restarting to apply the changes."}
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              Failed to {operation} variable <strong>{variableName}</strong>:{" "}
              {error.message}
            </Typography>
          </Alert>
        )}

        {stream && (
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ color: theme.palette.text.secondary }}
            >
              Output:
            </Typography>
            <Box ref={consoleBoxRef} sx={{ maxHeight: 400, overflowY: "auto" }}>
              <Console>{stream}</Console>
            </Box>
          </Box>
        )}

        {!stream && !loading && !error && success && (
          <Typography variant="body2" color="text.secondary">
            Operation completed without restart (norestart was enabled).
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Button
          onClick={onClose}
          variant={success ? "contained" : "outlined"}
          color={success ? "primary" : "inherit"}
          disabled={loading}
        >
          {loading ? "Please wait..." : "Close"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnvVarsStreamDialog;
