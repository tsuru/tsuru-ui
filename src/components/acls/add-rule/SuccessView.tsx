import { FunctionComponent } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Breadcrumbs,
  alpha,
  useTheme,
} from "@mui/material";
import { NavigateNext, Add, CheckCircle } from "@mui/icons-material";
import Link from "../../base/MuiLink";

type SuccessViewProps = {
  service: string;
  instanceName: string;
  onAddAnother: () => void;
  onViewRules: () => void;
};

const SuccessView: FunctionComponent<SuccessViewProps> = ({
  service,
  instanceName,
  onAddAnother,
  onViewRules,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ pb: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link href={`/services/${service}`} underline="hover" color="inherit">
          ACLs
        </Link>
        <Link
          href={`/services/${service}/${instanceName}`}
          underline="hover"
          color="inherit"
        >
          {instanceName}
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          Add Rule
        </Typography>
      </Breadcrumbs>

      <Paper
        elevation={0}
        sx={{
          maxWidth: 600,
          mx: "auto",
          p: 6,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.success.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <CheckCircle
            sx={{ fontSize: 40, color: theme.palette.success.main }}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          Rule Added Successfully
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Your ACL rule has been created and will be synced shortly.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" startIcon={<Add />} onClick={onAddAnother}>
            Add Another Rule
          </Button>
          <Button variant="contained" onClick={onViewRules}>
            View All Rules
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SuccessView;
