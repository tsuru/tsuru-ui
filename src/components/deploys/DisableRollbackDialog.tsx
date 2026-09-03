import { FunctionComponent, useState } from "react";
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
  Alert,
  Chip,
  Stack,
  Divider,
  Fade,
  Slide,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircleOutline,
  ErrorOutline,
  Block,
  WarningAmber,
} from "@mui/icons-material";
import { DisableRollbackState } from "../../hooks/app";

type DisableRollbackDialogProps = {
  open: boolean;
  appName: string;
  version: number;
  image: string;
  state: DisableRollbackState;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

const DisableRollbackDialog: FunctionComponent<DisableRollbackDialogProps> = ({
  open,
  appName,
  version,
  image,
  state,
  onConfirm,
  onClose,
}) => {
  const theme = useTheme();
  const [reason, setReason] = useState("");
  const { loading, error, success } = state;

  const isExecuting = loading || success || error;

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const getHeaderBackground = () => {
    if (loading) return alpha(theme.palette.primary.main, 0.08);
    if (success) return alpha(theme.palette.success.main, 0.08);
    if (error) return alpha(theme.palette.error.main, 0.08);
    return alpha(theme.palette.error.main, 0.08);
  };

  const getHeaderIcon = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.15),
          }}
        >
          <CircularProgress size={24} />
        </Box>
      );
    }
    if (success) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.success.main, 0.15),
          }}
        >
          <CheckCircleOutline
            sx={{ color: theme.palette.success.main, fontSize: 28 }}
          />
        </Box>
      );
    }
    if (error) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.error.main, 0.15),
          }}
        >
          <ErrorOutline
            sx={{ color: theme.palette.error.main, fontSize: 28 }}
          />
        </Box>
      );
    }
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.error.main, 0.15),
        }}
      >
        <Block sx={{ color: theme.palette.error.main, fontSize: 28 }} />
      </Box>
    );
  };

  const getTitle = () => {
    if (loading) return "Disabling Rollback...";
    if (success) return "Rollback Disabled";
    if (error) return "Failed to Disable";
    return "Disable Rollback";
  };

  const getSubtitle = () => {
    if (loading) return `Disabling rollback for version ${version}`;
    if (success) return `Version ${version} can no longer be used for rollback`;
    if (error) return `Failed to disable rollback for version ${version}`;
    return `Prevent rollback to version ${version}`;
  };

  return (
    <Dialog
      open={open}
      onClose={success || error ? handleClose : undefined}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" } as any}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 3,
          backgroundColor: getHeaderBackground(),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        {getHeaderIcon()}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {getTitle()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getSubtitle()}
          </Typography>
        </Box>
        <Chip
          label={`V${version}`}
          size="small"
          color={success ? "success" : "error"}
          variant={success ? "filled" : "outlined"}
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            height: 28,
            px: 0.5,
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Confirmation View */}
        {!isExecuting && (
          <Fade in timeout={300}>
            <Box>
              <Alert
                severity="warning"
                icon={<WarningAmber />}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  This action is irreversible
                </Typography>
                <Typography variant="body2">
                  Once disabled, this version will no longer be available for
                  rollback. Make sure you have a good reason for this action.
                </Typography>
              </Alert>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  mb: 3,
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: 1 }}
                >
                  Version Details
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Application
                    </Typography>
                    <Chip
                      label={appName}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Version
                    </Typography>
                    <Chip
                      label={`Version ${version}`}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Image
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        p: 1,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.common.black, 0.05),
                        wordBreak: "break-all",
                      }}
                    >
                      {image}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <TextField
                label="Reason for disabling"
                placeholder="e.g., Security vulnerability found, Critical bug discovered..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                required
                multiline
                rows={2}
                helperText="Please provide a reason why this version should not be used for rollback"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Fade>
        )}

        {/* Result View */}
        {isExecuting && (
          <Fade in timeout={300}>
            <Box>
              {/* Loading state */}
              {loading && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 6,
                    gap: 2,
                  }}
                >
                  <CircularProgress size={48} />
                  <Typography variant="body1" color="text.secondary">
                    Disabling rollback for version {version}...
                  </Typography>
                </Box>
              )}

              {/* Success Alert */}
              {success && (
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    "& .MuiAlert-message": { width: "100%" },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Rollback disabled successfully
                  </Typography>
                  <Typography variant="body2">
                    Version <strong>{version}</strong> of{" "}
                    <strong>{appName}</strong> can no longer be used for
                    rollback operations.
                  </Typography>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 2,
                    "& .MuiAlert-message": { width: "100%" },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Failed to disable rollback
                  </Typography>
                  <Typography variant="body2">{error.message}</Typography>
                </Alert>
              )}
            </Box>
          </Fade>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          gap: 1.5,
        }}
      >
        {!isExecuting && (
          <>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="inherit"
              sx={{
                px: 3,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="error"
              disabled={!reason.trim()}
              startIcon={<Block />}
              sx={{
                px: 3,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                "&:hover": {
                  boxShadow: `0 6px 16px ${alpha(
                    theme.palette.error.main,
                    0.4
                  )}`,
                },
              }}
            >
              Disable Rollback
            </Button>
          </>
        )}

        {isExecuting && (
          <Button
            onClick={handleClose}
            variant={success ? "contained" : "outlined"}
            color={success ? "primary" : "inherit"}
            disabled={loading}
            sx={{
              px: 4,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              ...(success && {
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}`,
              }),
            }}
          >
            {loading ? "Please wait..." : success ? "Done" : "Close"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DisableRollbackDialog;
