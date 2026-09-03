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
  TextField,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  NavigateNext,
  Dns,
  ArrowBack,
  InfoOutlined,
  MenuBook,
  OpenInNew,
  CheckCircle,
  WarningAmber,
} from "@mui/icons-material";

import Link from "../../components/base/MuiLink";
import config from "../../config";
import { useAddCName, useSetCertIssuer } from "../../hooks/app";
import { CreateMethod } from "../../components/wizard/types";
import IssuerSelector from "../../components/apps/cname-add/IssuerSelector";
import CompletionMethod from "../../components/apps/cname-add/CompletionMethod";
import CompletionInstructions from "../../components/apps/cname-add/CompletionInstructions";
import SuccessView from "../../components/apps/cname-add/SuccessView";

// Derived on render rather than at import time, since the issuers come from the
// config loaded at boot.
const defaultIssuerFromConfig = () =>
  config.certificateIssuers?.find((issuer) => issuer.recommended)?.value ??
  "none";

type DocCardProps = {
  title: string;
  description: string;
  url: string;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  checkboxLabel: string;
};

const DocCard: FunctionComponent<DocCardProps> = ({
  title,
  description,
  url,
  checked,
  onCheck,
  checkboxLabel,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${
          checked
            ? alpha(theme.palette.success.main, 0.4)
            : alpha(theme.palette.divider, 0.2)
        }`,
        bgcolor: checked
          ? alpha(theme.palette.success.main, 0.03)
          : alpha(theme.palette.background.default, 0.4),
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: checked
              ? alpha(theme.palette.success.main, 0.1)
              : alpha(theme.palette.primary.main, 0.08),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.3s ease-in-out",
          }}
        >
          {checked ? (
            <CheckCircle
              sx={{ fontSize: 18, color: theme.palette.success.main }}
            />
          ) : (
            <MenuBook
              sx={{ fontSize: 18, color: theme.palette.primary.main }}
            />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              {title}
            </Typography>
            <Button
              variant="text"
              size="small"
              endIcon={<OpenInNew sx={{ fontSize: 12 }} />}
              href={url}
              target="_blank"
              rel="noopener"
              component="a"
              sx={{
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.75rem",
                py: 0,
                px: 0.5,
                minWidth: 0,
                "&:hover": { bgcolor: "transparent" },
              }}
            >
              Open
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Stack>

      <FormControlLabel
        sx={{ mt: 1, ml: -0.5 }}
        control={
          <Checkbox
            size="small"
            checked={checked}
            onChange={(e) => onCheck(e.target.checked)}
            sx={{
              color: alpha(theme.palette.primary.main, 0.4),
              "&.Mui-checked": { color: theme.palette.success.main },
            }}
          />
        }
        label={
          <Typography variant="caption" fontWeight={500}>
            {checkboxLabel}
          </Typography>
        }
      />
    </Box>
  );
};

const AppCNameAddView: FunctionComponent = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const appName = params.name as string;

  useTitle(`Add CNAME: ${appName}`);

  const defaultIssuer = useMemo(defaultIssuerFromConfig, []);

  // Documentation acknowledgement
  const [dnsDocsRead, setDnsDocsRead] = useState(!config.cnameDnsDocs);
  const [certDocsRead, setCertDocsRead] = useState(!config.cnameCertDocs);

  // Form state
  const [cname, setCname] = useState("");
  const [issuer, setIssuer] = useState(defaultIssuer);
  const [method, setMethod] = useState<CreateMethod | undefined>(undefined);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Hooks
  const addCName = useAddCName(appName);
  const setCertIssuer = useSetCertIssuer(appName);

  const cnameValid = useMemo(() => {
    const trimmed = cname.trim();
    return trimmed.length > 0 && trimmed.includes(".");
  }, [cname]);

  const issuerSelected = issuer !== "";
  const selectedIssuerValue = issuer === "none" ? null : issuer;

  const handleSubmit = async () => {
    if (!cnameValid) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addCName(cname.trim());
      if (selectedIssuerValue) {
        await setCertIssuer(cname.trim(), selectedIssuerValue);
      }
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to add CNAME"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(false);
    setCname("");
    setIssuer(defaultIssuer);
    setMethod(undefined);
    setSubmitError(null);
  };

  const handleGoBack = () => navigate(`/apps/${appName}`);

  if (submitSuccess) {
    return (
      <Box sx={{ pb: 4 }}>
        <SuccessView
          appName={appName}
          cname={cname}
          onAddAnother={handleReset}
          onGoBack={handleGoBack}
        />
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
          Add CNAME
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
            <Dns sx={{ fontSize: 28, color: theme.palette.primary.main }} />
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
            Add CNAME
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a custom domain name and optionally configure a TLS certificate
            for your application
          </Typography>
        </Box>

        {/* Reverse Proxy Disclaimer */}
        {config.cnameReverseProxyDisclaimer && (
          <Alert
            severity="warning"
            icon={<WarningAmber />}
            sx={{
              mb: 4,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            }}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              {config.cnameReverseProxyDisclaimer.title}
            </Typography>
            <Typography component="ul" variant="body2" sx={{ m: 0, pl: 2 }}>
              {config.cnameReverseProxyDisclaimer.conditions.map(
                (condition) => (
                  <li key={condition}>{condition}</li>
                )
              )}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {config.cnameReverseProxyDisclaimer.note}
            </Typography>
          </Alert>
        )}

        {/* Step 1: DNS + CNAME */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            1. CNAME
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the hostname you want to associate with your application
          </Typography>

          {config.cnameDnsDocs && (
            <DocCard
              title={config.cnameDnsDocs.title}
              description={config.cnameDnsDocs.description}
              url={config.cnameDnsDocs.url}
              checked={dnsDocsRead}
              onCheck={setDnsDocsRead}
              checkboxLabel={config.cnameDnsDocs.checkboxLabel}
            />
          )}

          <Collapse in={dnsDocsRead}>
            <Fade in={dnsDocsRead} timeout={300}>
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Hostname"
                  placeholder="myapp.example.com"
                  value={cname}
                  onChange={(e) => setCname(e.target.value)}
                  variant="outlined"
                  size="small"
                  helperText={
                    cname.length > 0 && !cnameValid
                      ? "Enter a valid hostname (e.g. myapp.example.com)"
                      : undefined
                  }
                  error={cname.length > 0 && !cnameValid}
                />

                {config.cnameDnsPortalURL && (
                  <Alert
                    severity="info"
                    icon={<InfoOutlined />}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(
                        theme.palette.info.main,
                        0.2
                      )}`,
                    }}
                  >
                    <Typography variant="body2">
                      Remember to register this CNAME in our DNS provider.{" "}
                      <MuiLink
                        href={config.cnameDnsPortalURL}
                        target="_blank"
                        rel="noopener"
                        fontWeight={600}
                      >
                        Open DNS Portal
                      </MuiLink>
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Fade>
          </Collapse>
        </Box>

        {/* Step 2: Certificate */}
        <Collapse in={dnsDocsRead && cnameValid}>
          <Divider sx={{ my: 4 }} />
          <Fade in={dnsDocsRead && cnameValid} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                2. Certificate
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose a TLS certificate issuer for your CNAME, or skip if you
                don't need one
              </Typography>

              {config.cnameCertDocs && (
                <DocCard
                  title={config.cnameCertDocs.title}
                  description={config.cnameCertDocs.description}
                  url={config.cnameCertDocs.url}
                  checked={certDocsRead}
                  onCheck={setCertDocsRead}
                  checkboxLabel={config.cnameCertDocs.checkboxLabel}
                />
              )}

              <Collapse in={certDocsRead}>
                <Fade in={certDocsRead} timeout={300}>
                  <Box sx={{ mt: 3 }}>
                    <IssuerSelector value={issuer} onChange={setIssuer} />
                  </Box>
                </Fade>
              </Collapse>
            </Box>
          </Fade>
        </Collapse>

        {/* Step 3: Completion Method */}
        <Collapse
          in={dnsDocsRead && cnameValid && certDocsRead && issuerSelected}
        >
          <Divider sx={{ my: 4 }} />
          <Fade
            in={dnsDocsRead && cnameValid && certDocsRead && issuerSelected}
            timeout={300}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                3. Completion Method
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose how you want to add the CNAME
              </Typography>
              <CompletionMethod selectedMethod={method} onSelect={setMethod} />
            </Box>
          </Fade>
        </Collapse>

        {/* Step 4: Execute / Instructions */}
        <Collapse
          in={
            dnsDocsRead &&
            cnameValid &&
            certDocsRead &&
            issuerSelected &&
            method !== undefined
          }
        >
          <Divider sx={{ my: 4 }} />
          <Fade
            in={
              dnsDocsRead &&
              cnameValid &&
              certDocsRead &&
              issuerSelected &&
              method !== undefined
            }
            timeout={300}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                4. {method === "web" ? "Confirm" : "Instructions"}
              </Typography>

              {method === "web" && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Click the button below to add the CNAME
                  {selectedIssuerValue
                    ? " and configure the certificate issuer"
                    : ""}
                  .
                </Typography>
              )}

              {(method === "terraform" || method === "cli") && (
                <CompletionInstructions
                  method={method}
                  appName={appName}
                  cname={cname.trim()}
                  issuer={selectedIssuerValue}
                />
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
              startIcon={<Dns />}
              onClick={handleSubmit}
              disabled={!cnameValid || submitting}
              sx={{
                borderRadius: 2,
                px: 4,
                background:
                  cnameValid && !submitting
                    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                    : undefined,
                boxShadow:
                  cnameValid && !submitting
                    ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                    : undefined,
              }}
            >
              {submitting ? "Adding CNAME..." : "Add CNAME"}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AppCNameAddView;
