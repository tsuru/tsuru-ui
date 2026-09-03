import { FunctionComponent, useState, useMemo, useEffect } from "react";
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
  Link as LinkIcon,
  ArrowBack,
  CheckCircle,
  Add,
} from "@mui/icons-material";

import Link from "../../components/base/MuiLink";
import Console from "../../components/base/Console";
import CodeBlock from "../../components/base/CodeBlock";
import MethodSelectionStepBase from "../../components/wizard/MethodSelectionStep";
import { CreateMethod, MethodMessages } from "../../components/wizard/types";
import {
  useServiceInstances,
  useServiceInstanceBind,
} from "../../hooks/serviceInstance";
import { ServiceItem } from "../../types/serviceInstance";

const methodMessages: MethodMessages = {
  cli: "You'll run tsuru commands to bind the service instance to your app.",
  terraform: "Use Terraform resources to manage your service bind as code.",
  web: "The service instance will be bound directly through this interface with real-time output.",
};

const AppServiceBindAddView: FunctionComponent = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const appName = params.name as string;

  useTitle(`Bind Service: ${appName}`);

  // Form state
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [restartOnBind, setRestartOnBind] = useState(true);
  const [method, setMethod] = useState<CreateMethod | undefined>(undefined);

  // Submission state
  const [bindInitiated, setBindInitiated] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Hooks
  const serviceInstancesQuery = useServiceInstances();

  const { action, stream } = useServiceInstanceBind(
    selectedService,
    selectedInstance,
    appName,
    !restartOnBind,
    !bindInitiated
  );

  // Detect success
  useEffect(() => {
    if (action.value && bindInitiated) {
      setSubmitSuccess(true);
    }
  }, [action.value, bindInitiated]);

  // Derived data
  const serviceNames = useMemo(() => {
    if (!serviceInstancesQuery.value) return [];
    const names = new Set<string>();
    for (const item of serviceInstancesQuery.value as ServiceItem[]) {
      if (item.service) names.add(item.service);
    }
    return Array.from(names).sort();
  }, [serviceInstancesQuery.value]);

  const instanceNames = useMemo(() => {
    if (!serviceInstancesQuery.value || !selectedService) return [];
    const names: string[] = [];
    for (const item of serviceInstancesQuery.value as ServiceItem[]) {
      if (item.service === selectedService && item.service_instances) {
        names.push(...item.service_instances.map((i) => i.name));
      }
    }
    return names.sort();
  }, [serviceInstancesQuery.value, selectedService]);

  const isFormValid = useMemo(() => {
    return (
      selectedService.trim().length > 0 && selectedInstance.trim().length > 0
    );
  }, [selectedService, selectedInstance]);

  const handleGoBack = () => navigate(`/apps/${appName}/binds`);

  const handleReset = () => {
    setSubmitSuccess(false);
    setBindInitiated(false);
    setSelectedService("");
    setSelectedInstance("");
    setRestartOnBind(true);
    setMethod(undefined);
  };

  // Terraform snippet
  const terraformCode = `# Documentation: https://registry.terraform.io/providers/tsuru/tsuru/latest/docs/resources/service_instance_bind

resource "tsuru_service_instance_bind" "app_bind" {
  service_name      = "${selectedService}"
  service_instance  = "${selectedInstance}"
  app               = "${appName}"
  restart_on_update = ${restartOnBind}
}`;

  // CLI snippet
  const cliCode = `tsuru service instance bind ${selectedService} ${selectedInstance} -a ${appName}${
    !restartOnBind ? " --no-restart" : ""
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
            Bind Service
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
            Service Bound Successfully
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            <strong>{selectedInstance}</strong> ({selectedService}) has been
            bound to <strong>{appName}</strong>.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            The service environment variables are now available to your
            application.
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
              Bind Another Service
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
          Bind Service
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
            <LinkIcon
              sx={{ fontSize: 28, color: theme.palette.primary.main }}
            />
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
            Bind Service Instance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect a service instance to your application to inject its
            environment variables
          </Typography>
        </Box>

        {/* Step 1: Select Service */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            1. Select Service
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose the service that contains the instance you want to bind
          </Typography>
          <Autocomplete
            options={serviceNames}
            value={selectedService || null}
            onChange={(_, value) => {
              setSelectedService(value || "");
              setSelectedInstance("");
              setMethod(undefined);
            }}
            loading={serviceInstancesQuery.loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Service"
                placeholder="Search services..."
                size="small"
              />
            )}
          />
        </Box>

        {/* Step 2: Select Instance */}
        <Collapse in={selectedService.length > 0}>
          <Divider sx={{ my: 4 }} />
          <Fade in={selectedService.length > 0} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                2. Select Instance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose the service instance to bind to {appName}
              </Typography>
              <Autocomplete
                options={instanceNames}
                value={selectedInstance || null}
                onChange={(_, value) => {
                  setSelectedInstance(value || "");
                  setMethod(undefined);
                }}
                loading={serviceInstancesQuery.loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Instance"
                    placeholder="Search instances..."
                    size="small"
                  />
                )}
              />
            </Box>
          </Fade>
        </Collapse>

        {/* Step 3: Options */}
        <Collapse in={isFormValid}>
          <Divider sx={{ my: 4 }} />
          <Fade in={isFormValid} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                3. Options
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure bind options
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={restartOnBind}
                    onChange={(e) => setRestartOnBind(e.target.checked)}
                  />
                }
                label="Restart application after bind"
              />
            </Box>
          </Fade>
        </Collapse>

        {/* Step 4: Completion Method */}
        <Collapse in={isFormValid}>
          <Divider sx={{ my: 4 }} />
          <Fade in={isFormValid} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                4. Completion Method
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose how you want to bind the service instance
              </Typography>
              <MethodSelectionStepBase
                selectedMethod={method}
                onSelect={setMethod}
                resourceType="Service Bind"
                methodMessages={methodMessages}
              />
            </Box>
          </Fade>
        </Collapse>

        {/* Step 5: Execute / Instructions */}
        <Collapse in={isFormValid && method !== undefined}>
          <Divider sx={{ my: 4 }} />
          <Fade in={isFormValid && method !== undefined} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                5. {method === "web" ? "Confirm" : "Instructions"}
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

              {method === "web" && !bindInitiated && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Click the button below to bind{" "}
                  <strong>{selectedInstance}</strong> to{" "}
                  <strong>{appName}</strong>.
                </Typography>
              )}

              {method === "web" && bindInitiated && (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {action.error
                      ? `Error binding service instance to ${appName}`
                      : action.value
                      ? `Service instance bound to ${appName} successfully!`
                      : `Binding service instance to ${appName}...`}
                  </Typography>
                  <Console>{stream}</Console>
                  {action.error && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                      {action.error.message}
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          </Fade>
        </Collapse>

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

          {method === "web" && !bindInitiated && (
            <Button
              variant="contained"
              startIcon={<LinkIcon />}
              onClick={() => setBindInitiated(true)}
              disabled={!isFormValid}
              sx={{
                borderRadius: 2,
                px: 4,
                background: isFormValid
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                  : undefined,
                boxShadow: isFormValid
                  ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                  : undefined,
              }}
            >
              Bind Service
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AppServiceBindAddView;
