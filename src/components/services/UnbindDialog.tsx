import { FunctionComponent, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  Stack,
  Box,
  alpha,
  useTheme,
} from "@mui/material";
import Console from "../base/Console";
import { useServiceInstanceUnbind } from "../../hooks/serviceInstance";
import { useVolumeUnbind } from "../../hooks/volumes";

export type UnbindTarget =
  | { type: "service"; service: string; instance: string }
  | { type: "volume"; volume: string; app: string; mountPoint: string };

type UnbindDialogProps = {
  target: UnbindTarget | null;
  appName: string;
  onClose: () => void;
  onSuccess: () => void;
};

const UnbindDialog: FunctionComponent<UnbindDialogProps> = ({
  target,
  appName,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const [noRestart, setNoRestart] = useState(false);
  const [volumeUnbinding, setVolumeUnbinding] = useState(false);
  const [volumeError, setVolumeError] = useState<string | null>(null);

  const serviceUnbind = useServiceInstanceUnbind();
  const volumeUnbind = useVolumeUnbind();

  const isServiceTarget = target !== null && target.type === "service";
  const isVolumeTarget = target !== null && target.type === "volume";
  const isOperating = serviceUnbind.loading || volumeUnbinding;
  const isFinished = serviceUnbind.success;

  const handleClose = () => {
    if (isOperating) return;
    onClose();
    setNoRestart(false);
    setVolumeError(null);
    serviceUnbind.reset();
  };

  const handleSuccessClose = () => {
    handleClose();
    onSuccess();
  };

  const handleServiceUnbind = async () => {
    if (!target || target.type !== "service") return;
    await serviceUnbind.unbind(
      target.service,
      target.instance,
      appName,
      noRestart
    );
  };

  const handleVolumeUnbind = async () => {
    if (!target || target.type !== "volume") return;
    setVolumeUnbinding(true);
    setVolumeError(null);
    try {
      await volumeUnbind(
        target.volume,
        target.app,
        target.mountPoint,
        noRestart
      );
      handleClose();
      onSuccess();
    } catch (err) {
      setVolumeError(
        err instanceof Error ? err.message : "Failed to unbind volume"
      );
    } finally {
      setVolumeUnbinding(false);
    }
  };

  const targetLabel =
    target?.type === "service"
      ? `${target.instance} (${target.service})`
      : target?.type === "volume"
      ? `${target.volume} at ${target.mountPoint}`
      : "";

  return (
    <Dialog
      open={target !== null}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isFinished ? "Unbind Completed" : "Confirm Unbind"}
      </DialogTitle>
      <DialogContent>
        {!isFinished && !isOperating && (
          <Stack spacing={2}>
            <Typography variant="body2">
              Are you sure you want to unbind <strong>{targetLabel}</strong>{" "}
              from <strong>{appName}</strong>?
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={noRestart}
                  onChange={(e) => setNoRestart(e.target.checked)}
                />
              }
              label="Skip application restart"
            />
          </Stack>
        )}

        {/* Service unbind streaming output */}
        {isServiceTarget && (serviceUnbind.loading || serviceUnbind.stream) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {serviceUnbind.loading
                ? "Unbinding service instance..."
                : "Unbind completed successfully."}
            </Typography>
            <Console>{serviceUnbind.stream}</Console>
          </Box>
        )}

        {/* Service unbind error */}
        {isServiceTarget && serviceUnbind.error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {serviceUnbind.error.message}
          </Alert>
        )}

        {/* Volume unbind error */}
        {isVolumeTarget && volumeError && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {volumeError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {isFinished ? (
          <Button
            variant="contained"
            onClick={handleSuccessClose}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            Done
          </Button>
        ) : (
          <>
            <Button
              onClick={handleClose}
              disabled={isOperating}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={
                isServiceTarget ? handleServiceUnbind : handleVolumeUnbind
              }
              disabled={isOperating}
              sx={{
                borderRadius: 2,
                background: !isOperating
                  ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                  : undefined,
                boxShadow: !isOperating
                  ? `0 4px 14px ${alpha(theme.palette.error.main, 0.3)}`
                  : undefined,
              }}
            >
              {isOperating ? "Unbinding..." : "Unbind"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UnbindDialog;
