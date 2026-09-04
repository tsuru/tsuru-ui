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
} from "@mui/material";
import {
  NavigateNext,
  Shield,
  Warning,
  Info,
  ArrowBack,
} from "@mui/icons-material";

import Link from "../../components/base/MuiLink";
import { useAddACLRule } from "../../hooks/acl";
import { ACLRuleType, ACLProtoPort } from "../../types/acl";
import config from "../../config";
import { useServiceInstances } from "../../hooks/serviceInstance";
import { ServiceInstance } from "../../types/serviceInstance";
import { useAppsSimplified } from "../../hooks/app";
import {
  DestinationCard,
  TsuruAppFields,
  RpaasFields,
  ExternalDNSFields,
  ExternalIPFields,
  SuccessView,
  DestinationType,
  destinationOptions,
  validateCIDR,
  DEFAULT_PROXY,
} from "../../components/acls/add-rule";
import DisplayError from "../../components/base/DisplayError";

// Derived on render rather than at import time, since the services come from
// the config loaded at boot.
const rpaasServicesFromConfig = () =>
  (config.services || [])
    .filter((s) => s.engine === "rpaas")
    .map((s) => s.name);

type ACLAddRuleProps = {
  service: string;
};

const ACLAddRule: FunctionComponent<ACLAddRuleProps> = ({ service }) => {
  const rpaasServices = useMemo(rpaasServicesFromConfig, []);
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const instanceName = params.instanceName as string;

  useTitle(`Add ACL Rule: ${instanceName}`);

  // Form state
  const [destinationType, setDestinationType] =
    useState<DestinationType | null>(null);
  const [tsuruAppName, setTsuruAppName] = useState("");
  const [rpaasServiceName, setRpaasServiceName] = useState("");
  const [rpaasInstanceName, setRpaasInstanceName] = useState("");
  const [externalDNS, setExternalDNS] = useState("");
  const [externalIP, setExternalIP] = useState("");
  const [ports, setPorts] = useState<ACLProtoPort[]>([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Hooks
  const addRule = useAddACLRule();
  const serviceInstancesQuery = useServiceInstances();
  const appsQuery = useAppsSimplified();

  // Derived data
  const appNames = useMemo(() => {
    if (!appsQuery.value) return [];
    return appsQuery.value.map((app) => app.name).sort();
  }, [appsQuery.value]);

  const rpaasInstances = useMemo(() => {
    if (!serviceInstancesQuery.value || !rpaasServiceName) return [];
    const allInstances: ServiceInstance[] = [];
    for (const item of serviceInstancesQuery.value) {
      if (item.service === rpaasServiceName && item.service_instances) {
        allInstances.push(...item.service_instances);
      }
    }
    return allInstances.map((inst) => inst.name).sort();
  }, [serviceInstancesQuery.value, rpaasServiceName]);

  const isFormValid = useMemo(() => {
    if (!destinationType) return false;
    switch (destinationType) {
      case "tsuruApp":
        return Boolean(tsuruAppName.trim());
      case "rpaasInstance":
        return Boolean(rpaasServiceName.trim() && rpaasInstanceName.trim());
      case "externalDNS":
        return Boolean(externalDNS.trim());
      case "externalIP":
        return Boolean(externalIP.trim()) && validateCIDR(externalIP);
      default:
        return false;
    }
  }, [
    destinationType,
    tsuruAppName,
    rpaasServiceName,
    rpaasInstanceName,
    externalDNS,
    externalIP,
  ]);

  const externalDNSOutsideInternet =
    destinationType === "externalDNS" &&
    externalDNS.length > 0 &&
    config.internalDomains &&
    !config.internalDomains.some((domain) => externalDNS.endsWith(domain));

  // Port handlers
  const addPort = () => setPorts([...ports, { Port: 0, Protocol: "TCP" }]);
  const updatePort = (index: number, port: ACLProtoPort) => {
    const newPorts = [...ports];
    newPorts[index] = port;
    setPorts(newPorts);
  };
  const removePort = (index: number) =>
    setPorts(ports.filter((_, i) => i !== index));

  // Form submission
  const buildDestination = (): ACLRuleType => {
    const validPorts = ports.filter((p) => p.Port > 0 && p.Port <= 65535);
    switch (destinationType) {
      case "tsuruApp":
        return { TsuruApp: { AppName: tsuruAppName.trim() } };
      case "rpaasInstance":
        return {
          RpaasInstance: {
            ServiceName: rpaasServiceName.trim(),
            Instance: rpaasInstanceName.trim(),
          },
        };
      case "externalDNS":
        return { ExternalDNS: { Name: externalDNS.trim(), Ports: validPorts } };
      case "externalIP":
        return { ExternalIP: { IP: externalIP.trim(), Ports: validPorts } };
      default:
        return {};
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addRule(service, instanceName, buildDestination());
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add rule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(false);
    setDestinationType(null);
    setTsuruAppName("");
    setRpaasServiceName("");
    setRpaasInstanceName("");
    setExternalDNS("");
    setExternalIP("");
    setPorts([]);
  };

  const handleGoBack = () =>
    navigate(`/services/${service}/${instanceName}/rules`);

  // Success view
  if (submitSuccess) {
    return (
      <SuccessView
        service={service}
        instanceName={instanceName}
        onAddAnother={handleReset}
        onViewRules={handleGoBack}
      />
    );
  }

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
            <Shield sx={{ fontSize: 28, color: theme.palette.primary.main }} />
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
            Add ACL Rule
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Allow your application to communicate with external destinations
          </Typography>
        </Box>

        {/* Zero Trust Alert */}
        <Alert
          severity="info"
          icon={<Info />}
          sx={{
            mb: 4,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Typography variant="body2">
            <strong>Zero Trust Policy:</strong> By default, applications have no
            outbound access. Add rules to explicitly allow egress traffic.
          </Typography>
        </Alert>

        {appsQuery.error && <DisplayError error={appsQuery.error} />}
        {serviceInstancesQuery.error && (
          <DisplayError error={serviceInstancesQuery.error} />
        )}

        {/* Step 1: Destination Type */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            1. Select Destination Type
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose where you want to allow traffic to
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {destinationOptions.map((option) => (
              <DestinationCard
                key={option.id}
                option={option}
                selected={destinationType === option.id}
                onSelect={() => setDestinationType(option.id)}
              />
            ))}
          </Box>
        </Box>

        {/* Step 2: Configuration */}
        <Collapse in={Boolean(destinationType)}>
          <Divider sx={{ my: 4 }} />
          <Fade in={Boolean(destinationType)} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                2. Configure Destination
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter the details for your selected destination
              </Typography>

              {/* Proxy Warning */}
              <Collapse in={externalDNSOutsideInternet}>
                <Alert
                  severity="warning"
                  icon={<Warning />}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.warning.main,
                      0.3
                    )}`,
                  }}
                >
                  <Typography variant="body2">
                    <strong>Proxy Configuration Required:</strong> Internet
                    access requires your application to use a proxy.
                  </Typography>
                  <Box
                    component="code"
                    sx={{
                      display: "block",
                      mt: 1,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.common.black, 0.04),
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    HTTP_PROXY={DEFAULT_PROXY}
                    <br />
                    HTTPS_PROXY={DEFAULT_PROXY}
                    <br />
                    NO_PROXY=
                    {["127.0.0.1", "10.", "100.64.0.0/10", "localhost"]
                      .concat(config.internalDomains || [])
                      .join(",")}
                  </Box>
                </Alert>
              </Collapse>

              <Stack spacing={3}>
                {destinationType === "tsuruApp" && (
                  <TsuruAppFields
                    appName={tsuruAppName}
                    onAppNameChange={setTsuruAppName}
                    appNames={appNames}
                    loading={appsQuery.loading}
                  />
                )}

                {destinationType === "rpaasInstance" && (
                  <RpaasFields
                    serviceName={rpaasServiceName}
                    instanceName={rpaasInstanceName}
                    onServiceNameChange={setRpaasServiceName}
                    onInstanceNameChange={setRpaasInstanceName}
                    serviceNames={rpaasServices}
                    instanceNames={rpaasInstances}
                    loading={serviceInstancesQuery.loading}
                  />
                )}

                {destinationType === "externalDNS" && (
                  <ExternalDNSFields
                    hostname={externalDNS}
                    onHostnameChange={setExternalDNS}
                    ports={ports}
                    onAddPort={addPort}
                    onUpdatePort={updatePort}
                    onRemovePort={removePort}
                  />
                )}

                {destinationType === "externalIP" && (
                  <ExternalIPFields
                    ip={externalIP}
                    onIPChange={setExternalIP}
                    ports={ports}
                    onAddPort={addPort}
                    onUpdatePort={updatePort}
                    onRemovePort={removePort}
                  />
                )}
              </Stack>
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

          <Button
            variant="contained"
            startIcon={<Shield />}
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
            {submitting ? "Adding Rule..." : "Add Rule"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ACLAddRule;
