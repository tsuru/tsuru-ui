import { FunctionComponent, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTitle } from "react-use";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  alpha,
  useTheme,
  Fade,
  Breadcrumbs,
  Divider,
  Collapse,
  Autocomplete,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  NavigateNext,
  Folder,
  ArrowBack,
  CheckCircle,
  Add,
} from "@mui/icons-material";

import Link from "../../components/base/MuiLink";
import CodeBlock from "../../components/base/CodeBlock";
import MethodSelectionStepBase from "../../components/wizard/MethodSelectionStep";
import { CreateMethod, MethodMessages } from "../../components/wizard/types";
import { useVolumes, useVolumeBindAdd } from "../../hooks/volumes";

const methodMessages: MethodMessages = {
  cli: "You'll run tsuru commands to bind the volume to your app.",
  terraform: "Use Terraform resources to manage your volume bind as code.",
  web: "The volume will be bound directly through this interface.",
};

const AppVolumeBindAddView: FunctionComponent = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const appName = params.name as string;

  useTitle(`Bind Volume: ${appName}`);

  // Form state
  const [selectedVolume, setSelectedVolume] = useState<string>("");
  const [mountPoint, setMountPoint] = useState<string>("");
  const [readOnly, setReadOnly] = useState(false);
  const [method, setMethod] = useState<CreateMethod | undefined>(undefined);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Hooks
  const volumesQuery = useVolumes();
  const volumeBindAdd = useVolumeBindAdd();

  // Derived data
  const volumeNames = useMemo(() => {
    if (!volumesQuery.value) return [];
    return volumesQuery.value.map((v) => v.Name);
  }, [volumesQuery.value]);

  const isFormValid = useMemo(() => {
    return (
      selectedVolume.trim().length > 0 &&
      mountPoint.trim().length > 0 &&
      mountPoint.trim().startsWith("/")
    );
  }, [selectedVolume, mountPoint]);

  const handleGoBack = () => navigate(`/apps/${appName}/binds`);

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await volumeBindAdd(selectedVolume, appName, mountPoint.trim(), readOnly);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to bind volume"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(false);
    setSelectedVolume("");
    setMountPoint("");
    setReadOnly(false);
    setMethod(undefined);
    setSubmitError(null);
  };

  // Terraform snippet
  const terraformCode = `# Documentation: https://registry.terraform.io/providers/tsuru/tsuru/latest/docs/resources/volume_bind

resource "tsuru_volume_bind" "vol_bind" {
  volume      = "${selectedVolume}"
  app         = "${appName}"
  mount_point = "${mountPoint.trim()}"
  read_only   = ${readOnly}
}`;

  // CLI snippet
  const cliCode = `tsuru volume bind ${selectedVolume} ${mountPoint.trim()} -a ${appName}${
    readOnly ? " --readonly" : ""
  }`;

  // Success view
  if (submitSuccess) {
    return (
      <Box sx={{ pb: 4 }}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link href="/apps" underline="hover" color="inherit">
            Apps
          </Link>
          <Link href={`/apps/${appName}`} underline="hover" color="inherit">
            {appName}
          </Link>
          <Typography color="text.primary" fontWeight={600}>
            Bind Volume
          </Typography>
        </Breadcrumbs>

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
            <CheckCircle
              sx={{ fontSize: 40, color: theme.palette.success.main }}
            />
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Volume Bound Successfully
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Volume <strong>{selectedVolume}</strong> has been mounted on{" "}
            <strong>{appName}</strong> at <code>{mountPoint}</code>.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {readOnly
              ? "The volume is mounted as read-only."
              : "The volume is mounted with read-write access."}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Back to App
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleReset}
              sx={{
                borderRadius: 2,
                px: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              Bind Another Volume
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link href="/apps" underline="hover" color="inherit">
          Apps
        </Link>
        <Link href={`/apps/${appName}`} underline="hover" color="inherit">
          {appName}
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          Bind Volume
        </Typography>
      </Breadcrumbs>

      <Paper
        elevation={0}
        sx={{
          mx: "auto",
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.95
          )} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <Folder sx={{ fontSize: 28, color: theme.palette.primary.main }} />
          </Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Bind Volume
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mount a persistent volume to your application at a specific path
          </Typography>
        </Box>

        {/* Step 1: Select Volume */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            1. Select Volume
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose the volume you want to mount on your application
          </Typography>
          <Autocomplete
            options={volumeNames}
            value={selectedVolume || null}
            onChange={(_, value) => {
              setSelectedVolume(value || "");
              setMethod(undefined);
            }}
            loading={volumesQuery.loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Volume"
                placeholder="Search volumes..."
                size="small"
              />
            )}
          />
        </Box>

        {/* Step 2: Configure Mount */}
        <Collapse in={selectedVolume.length > 0}>
          <Divider sx={{ my: 4 }} />
          <Fade in={selectedVolume.length > 0} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                2. Configure Mount
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Specify the mount point and access mode
              </Typography>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Mount Point"
                  placeholder="/data/myvolume"
                  value={mountPoint}
                  onChange={(e) => {
                    setMountPoint(e.target.value);
                    setMethod(undefined);
                  }}
                  variant="outlined"
                  size="small"
                  helperText={
                    mountPoint.length > 0 && !mountPoint.trim().startsWith("/")
                      ? "Mount point must be an absolute path (start with /)"
                      : "The path where the volume will be mounted inside the container"
                  }
                  error={
                    mountPoint.length > 0 && !mountPoint.trim().startsWith("/")
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={readOnly}
                      onChange={(e) => setReadOnly(e.target.checked)}
                    />
                  }
                  label="Mount as read-only"
                />
              </Stack>
            </Box>
          </Fade>
        </Collapse>

        {/* Step 3: Completion Method */}
        <Collapse in={isFormValid}>
          <Divider sx={{ my: 4 }} />
          <Fade in={isFormValid} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                3. Completion Method
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose how you want to bind the volume
              </Typography>
              <MethodSelectionStepBase
                selectedMethod={method}
                onSelect={setMethod}
                resourceType="Volume Bind"
                methodMessages={methodMessages}
              />
            </Box>
          </Fade>
        </Collapse>

        {/* Step 4: Execute / Instructions */}
        <Collapse in={isFormValid && method !== undefined}>
          <Divider sx={{ my: 4 }} />
          <Fade in={isFormValid && method !== undefined} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                4. {method === "web" ? "Confirm" : "Instructions"}
              </Typography>

              {method === "terraform" && (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Add the following to your Terraform configuration:
                  </Typography>
                  <CodeBlock
                    code={terraformCode}
                    language="hcl"
                    title="main.tf"
                  />
                </Stack>
              )}

              {method === "cli" && (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Run the following command:
                  </Typography>
                  <CodeBlock code={cliCode} language="bash" title="Terminal" />
                </Stack>
              )}

              {method === "web" && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Click the button below to mount{" "}
                  <strong>{selectedVolume}</strong> on{" "}
                  <strong>{appName}</strong> at <code>{mountPoint}</code>.
                </Typography>
              )}
            </Box>
          </Fade>
        </Collapse>

        {/* Error */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Actions */}
        <Divider sx={{ my: 3 }} />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{
              borderRadius: 2,
              px: 3,
              borderColor: alpha(theme.palette.divider, 0.3),
              "&:hover": { borderColor: theme.palette.primary.main },
            }}
          >
            Cancel
          </Button>

          {method === "web" && (
            <Button
              variant="contained"
              startIcon={<Folder />}
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              sx={{
                borderRadius: 2,
                px: 4,
                background:
                  isFormValid && !submitting
                    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                    : undefined,
                boxShadow:
                  isFormValid && !submitting
                    ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                    : undefined,
              }}
            >
              {submitting ? "Binding Volume..." : "Bind Volume"}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AppVolumeBindAddView;
