import { FunctionComponent } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import { CheckCircle, ArrowBack, Add } from "@mui/icons-material";

type SuccessViewProps = {
  appName: string;
  cname: string;
  onAddAnother: () => void;
  onGoBack: () => void;
};

const SuccessView: FunctionComponent<SuccessViewProps> = ({
  appName,
  cname,
  onAddAnother,
  onGoBack,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        mx: "auto",
        p: 6,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.paper,
          0.95
        )} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.success.main, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main }} />
      </Box>

      <Typography variant="h5" fontWeight={700} gutterBottom>
        CNAME Added Successfully
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        The CNAME <strong>{cname}</strong> has been added to{" "}
        <strong>{appName}</strong>.
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Make sure to register the DNS entry at your DNS provider.
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onGoBack}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Back to App
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddAnother}
          sx={{
            borderRadius: 2,
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          Add Another CNAME
        </Button>
      </Stack>
    </Paper>
  );
};

export default SuccessView;
