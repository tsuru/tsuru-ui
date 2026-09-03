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
  Chip,
  Stack,
  Divider,
  Fade,
  Slide,
} from "@mui/material";
import {
  CheckCircleOutline,
  ErrorOutline,
  History,
  WarningAmber,
  Rocket,
  Terminal,
} from "@mui/icons-material";
import Console from "../base/Console";
import { RollbackStreamState } from "../../hooks/app";

type RollbackDialogProps = {
  open: boolean;
  appName: string;
  version: number;
  image: string;
  streamState: RollbackStreamState;
  onConfirm: () => void;
  onClose: () => void;
};

const RollbackDialog: FunctionComponent<RollbackDialogProps> = ({
  open,
  appName,
  version,
  image,
  streamState,
  onConfirm,
  onClose,
}) => {
  const theme = useTheme();
  const consoleRef = useRef<HTMLDivElement>(null);
  const { stream, loading, error, success } = streamState;

  const isExecuting = loading || success || error;

  // Auto-scroll console to bottom when stream updates
  useEffect(() => {
    if (consoleRef.current && stream) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [stream]);

  const getHeaderBackground = () => {
    if (loading) return alpha(theme.palette.primary.main, 0.08);
    if (success) return alpha(theme.palette.success.main, 0.08);
    if (error) return alpha(theme.palette.error.main, 0.08);
    return alpha(theme.palette.warning.main, 0.08);
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
          <Rocket
            sx={{
              color: theme.palette.primary.main,
              fontSize: 28,
              animation: "pulse 1.5s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.6, transform: "scale(0.95)" },
              },
            }}
          />
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
          bgcolor: alpha(theme.palette.warning.main, 0.15),
        }}
      >
        <History sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
      </Box>
    );
  };

  const getTitle = () => {
    if (loading) return "Deploying Rollback...";
    if (success) return "Rollback Successful!";
    if (error) return "Rollback Failed";
    return "Confirm Rollback";
  };

  const getSubtitle = () => {
    if (loading) return `Rolling back ${appName} to version ${version}`;
    if (success) return `${appName} is now running version ${version}`;
    if (error) return `Failed to rollback ${appName}`;
    return `You are about to rollback ${appName}`;
  };

  return (
    <Dialog
      open={open}
      onClose={success || error ? onClose : undefined}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" } as any}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          minHeight: isExecuting ? 450 : "auto",
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
          color={success ? "success" : loading ? "primary" : "warning"}
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            height: 28,
            px: 0.5,
          }}
        />
      </DialogTitle>

      {/* Loading Progress */}
      {loading && (
        <LinearProgress
          sx={{
            height: 3,
            "& .MuiLinearProgress-bar": {
              transition: "none",
            },
          }}
        />
      )}

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
                  Are you sure you want to rollback?
                </Typography>
                <Typography variant="body2">
                  This action will deploy the previous version of your
                  application. The current running version will be replaced.
                </Typography>
              </Alert>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: 1 }}
                >
                  Rollback Details
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
                      Target Version
                    </Typography>
                    <Chip
                      label={`Version ${version}`}
                      size="small"
                      color="warning"
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
            </Box>
          </Fade>
        )}

        {/* Execution View */}
        {isExecuting && (
          <Fade in timeout={300}>
            <Box>
              {/* Success Alert */}
              {success && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    "& .MuiAlert-message": { width: "100%" },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Rollback completed successfully!
                  </Typography>
                  <Typography variant="body2">
                    Your application <strong>{appName}</strong> has been rolled
                    back to <strong>version {version}</strong>. The new version
                    is now live.
                  </Typography>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    "& .MuiAlert-message": { width: "100%" },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Rollback failed
                  </Typography>
                  <Typography variant="body2">{error.message}</Typography>
                </Alert>
              )}

              {/* Console Output */}
              {stream && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Terminal
                      sx={{ fontSize: 18, color: theme.palette.text.secondary }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      Deploy Output
                    </Typography>
                    {loading && (
                      <Chip
                        label="Live"
                        size="small"
                        color="success"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          animation: "blink 1.5s ease-in-out infinite",
                          "@keyframes blink": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                          },
                        }}
                      />
                    )}
                  </Box>
                  <Box
                    ref={consoleRef}
                    sx={{
                      maxHeight: 280,
                      overflow: "auto",
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      "& pre": {
                        m: 0,
                        borderRadius: 2,
                        maxHeight: "none",
                      },
                    }}
                  >
                    <Console>{stream}</Console>
                  </Box>
                </Box>
              )}

              {/* Loading state without stream yet */}
              {loading && !stream && (
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
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Rocket
                      sx={{
                        fontSize: 32,
                        color: theme.palette.primary.main,
                        animation: "rocket 1s ease-in-out infinite",
                        "@keyframes rocket": {
                          "0%, 100%": { transform: "translateY(0)" },
                          "50%": { transform: "translateY(-4px)" },
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    Initiating rollback...
                  </Typography>
                </Box>
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
              onClick={onClose}
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
              onClick={onConfirm}
              variant="contained"
              color="warning"
              startIcon={<History />}
              sx={{
                px: 3,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.warning.main,
                  0.3
                )}`,
                "&:hover": {
                  boxShadow: `0 6px 16px ${alpha(
                    theme.palette.warning.main,
                    0.4
                  )}`,
                },
              }}
            >
              Confirm Rollback
            </Button>
          </>
        )}

        {isExecuting && (
          <Button
            onClick={onClose}
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

export default RollbackDialog;
