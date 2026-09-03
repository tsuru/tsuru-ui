import { FunctionComponent } from "react";
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Warning, Delete } from "@mui/icons-material";

type EnvVarsDeleteDialogProps = {
  open: boolean;
  variableName: string;
  norestart: boolean;
  onNorestartChange: (value: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

const EnvVarsDeleteDialog: FunctionComponent<EnvVarsDeleteDialogProps> = ({
  open,
  variableName,
  norestart,
  onNorestartChange,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: alpha(theme.palette.error.main, 0.05),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Warning sx={{ color: theme.palette.error.main }} />
        <Typography variant="h6" component="span">
          Delete Environment Variable
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete the environment variable:
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.error.main, 0.05),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: "monospace",
              fontWeight: 600,
              color: theme.palette.error.main,
            }}
          >
            {variableName}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={norestart}
                onChange={(e) => onNorestartChange(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Do not restart the application after deletion
              </Typography>
            }
          />
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2 }}
        >
          {norestart
            ? "The application will not restart. The variable will be removed but the running instances will keep using the old configuration until the next deploy or restart."
            : "The application will restart after the variable is deleted to apply the changes."}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={<Delete />}
        >
          {loading ? "Deleting..." : "Delete Variable"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnvVarsDeleteDialog;
