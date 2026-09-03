import { FunctionComponent, useState, useEffect } from "react";
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
  CircularProgress,
  Fade,
  Chip,
  Stack,
} from "@mui/material";
import {
  Warning,
  Delete,
  CheckCircleOutline,
  ErrorOutline,
  WarningAmber,
} from "@mui/icons-material";

type KillStatus = "idle" | "loading" | "success" | "error";

type UnitKillDialogProps = {
  open: boolean;
  unitName: string;
  appName: string;
  force: boolean;
  onConfirm: () => Promise<boolean>;
  onCancel: () => void;
  onSuccess?: () => void;
  error?: Error | null;
};

const UnitKillDialog: FunctionComponent<UnitKillDialogProps> = ({
  open,
  unitName,
  appName,
  force,
  onConfirm,
  onCancel,
  onSuccess,
  error: externalError,
}) => {
  const theme = useTheme();
  const [status, setStatus] = useState<KillStatus>("idle");
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setCountdown(5);
      setErrorMessage(null);
    }
  }, [open]);

  // Update error message when externalError changes
  useEffect(() => {
    if (externalError && status === "error") {
      setErrorMessage(externalError.message);
    }
  }, [externalError, status]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "success" && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (status === "success" && countdown === 0) {
      onSuccess?.();
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  const handleConfirm = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const success = await onConfirm();
      if (success) {
        setStatus("success");
      } else {
        setStatus("error");
        // Don't use externalError here as it won't be updated yet
        // It will be displayed via useEffect when the prop updates
        setErrorMessage("Failed to kill unit. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  const handleClose = () => {
    if (status !== "loading") {
      onCancel();
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return (
          <CircularProgress
            size={48}
            sx={{
              color: force
                ? theme.palette.error.main
                : theme.palette.warning.main,
            }}
          />
        );
      case "success":
        return (
          <CheckCircleOutline
            sx={{ fontSize: 48, color: theme.palette.success.main }}
          />
        );
      case "error":
        return (
          <ErrorOutline
            sx={{ fontSize: 48, color: theme.palette.error.main }}
          />
        );
      default:
        return null;
    }
  };

  const accentColor = force
    ? theme.palette.error.main
    : theme.palette.warning.main;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: `1px solid ${alpha(accentColor, 0.3)}`,
          overflow: "hidden",
        },
      }}
    >
      {status === "idle" && (
        <>
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              backgroundColor: alpha(accentColor, 0.08),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              py: 2,
            }}
          >
            {force ? (
              <Warning sx={{ color: accentColor, fontSize: 28 }} />
            ) : (
              <WarningAmber sx={{ color: accentColor, fontSize: 28 }} />
            )}
            <Box>
              <Typography variant="h6" component="span" fontWeight={600}>
                {force ? "Force Kill Unit" : "Kill Unit"}
              </Typography>
              {force && (
                <Chip
                  label="FORCE"
                  size="small"
                  sx={{
                    ml: 1.5,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    backgroundColor: alpha(accentColor, 0.15),
                    color: accentColor,
                    border: `1px solid ${alpha(accentColor, 0.3)}`,
                  }}
                />
              )}
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {force
                ? "This action will forcefully terminate the unit immediately without respecting the minimum of available units. This may lead to service disruption."
                : "This action will terminate the unit, respecting the minimum of available units to maintain service stability."}
            </Typography>

            <Box
              sx={{
                mt: 3,
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(accentColor, 0.06),
                border: `1px solid ${alpha(accentColor, 0.2)}`,
              }}
            >
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ minWidth: 40 }}
                  >
                    App
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {appName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ minWidth: 40, pt: 0.25 }}
                  >
                    Unit
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: accentColor,
                      wordBreak: "break-all",
                    }}
                  >
                    {unitName}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: 2.5,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              gap: 1,
            }}
          >
            <Button
              onClick={onCancel}
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.divider, 0.3),
                color: theme.palette.text.secondary,
                "&:hover": {
                  borderColor: theme.palette.divider,
                  backgroundColor: alpha(theme.palette.action.hover, 0.04),
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color={force ? "error" : "warning"}
              onClick={handleConfirm}
              startIcon={<Delete />}
              sx={{
                fontWeight: 600,
                px: 3,
                boxShadow: `0 2px 8px ${alpha(accentColor, 0.3)}`,
                "&:hover": {
                  boxShadow: `0 4px 12px ${alpha(accentColor, 0.4)}`,
                },
              }}
            >
              {force ? "Force Kill" : "Kill Unit"}
            </Button>
          </DialogActions>
        </>
      )}

      {status !== "idle" && (
        <Box
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 280,
          }}
        >
          <Fade in timeout={300}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              {getStatusIcon()}

              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mt: 1 }}
                color={
                  status === "success"
                    ? "success.main"
                    : status === "error"
                    ? "error.main"
                    : "text.primary"
                }
              >
                {status === "loading" && "Killing unit..."}
                {status === "success" && "Unit killed successfully!"}
                {status === "error" && "Failed to kill unit"}
              </Typography>

              {status === "loading" && (
                <Typography variant="body2" color="text.secondary">
                  Please wait while we terminate the unit.
                </Typography>
              )}

              {status === "error" && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", maxWidth: 350 }}
                  >
                    {errorMessage}
                  </Typography>
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      sx={{ borderColor: alpha(theme.palette.divider, 0.3) }}
                    >
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      color={force ? "error" : "warning"}
                      onClick={() => setStatus("idle")}
                    >
                      Try Again
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Fade>
        </Box>
      )}
    </Dialog>
  );
};

export default UnitKillDialog;
