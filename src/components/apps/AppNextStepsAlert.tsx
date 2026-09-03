import { FunctionComponent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  RocketLaunch,
  Security,
  Close,
  ArrowForward,
} from "@mui/icons-material";
import { App } from "../../types/app";
import config from "../../config";
import { useCreateAndBindACL } from "../../hooks/acl";

type AppNextStepsAlertProps = {
  app: App;
  onAclCreated?: () => void;
};

const getDeployGuideUrl = (platform?: string): string => {
  const normalizedPlatform = platform?.toLowerCase() || "";
  const guides = config.platformGuides || {};
  return guides[normalizedPlatform] || guides["dockerfile"] || "";
};

const AppNextStepsAlert: FunctionComponent<AppNextStepsAlertProps> = ({
  app,
  onAclCreated,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const acl = useCreateAndBindACL();

  const needsDeploy = app.deploys === 0;
  const hasAclBind = app.serviceInstanceBinds?.some(
    (bind) => bind.service === "acl"
  );

  const handleCreateAcl = async () => {
    const success = await acl.execute({
      appName: app.name,
      teamOwner: app.teamowner,
      teams: app.teams,
      tags: app.tags,
    });

    if (success) {
      onAclCreated?.();
      navigate(`/services/acl/${app.name}/add`);
    }
  };

  const deployGuideUrl = getDeployGuideUrl(app.platform);

  // Alerts are mutually exclusive - deploy alert has precedence
  const showDeployAlert = needsDeploy && !dismissed;
  const showAclAlert = !needsDeploy && !hasAclBind && !dismissed;

  if (!showDeployAlert && !showAclAlert) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      {/* Deploy Alert - has precedence */}
      <Collapse in={showDeployAlert}>
        <Alert
          severity="info"
          icon={<RocketLaunch />}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            "& .MuiAlert-icon": { alignItems: "center" },
            "& .MuiAlert-message": { width: "100%" },
          }}
          action={
            <IconButton size="small" onClick={() => setDismissed(true)}>
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ width: "100%" }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600} component="span">
                Ready for your first deploy!
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
                sx={{ ml: 1 }}
              >
                Follow our guide to deploy your application.
              </Typography>
            </Box>
            {deployGuideUrl && (
              <Button
                size="small"
                variant="outlined"
                color="info"
                endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                component={MuiLink}
                href={deployGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                {app.platform
                  ? `Guide to deploy ${app.platform} apps`
                  : "Deploy guide"}
              </Button>
            )}
          </Stack>
        </Alert>
      </Collapse>

      {/* ACL Alert - only shows if deploy alert is not shown */}
      <Collapse in={showAclAlert}>
        <Alert
          severity={acl.status === "error" ? "error" : "warning"}
          icon={<Security />}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(
              acl.status === "error"
                ? theme.palette.error.main
                : theme.palette.warning.main,
              0.3
            )}`,
            "& .MuiAlert-icon": { alignItems: "center" },
            "& .MuiAlert-message": { width: "100%" },
          }}
          action={
            <IconButton size="small" onClick={() => setDismissed(true)}>
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ width: "100%" }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600} component="span">
                Having trouble connecting to external services?
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
                sx={{ ml: 1 }}
              >
                Add an ACL to manage network access rules.
              </Typography>
              {acl.error && (
                <Typography
                  variant="caption"
                  color="error"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  {acl.error}
                </Typography>
              )}
            </Box>
            <Button
              size="small"
              variant="contained"
              color="warning"
              startIcon={
                acl.status === "creating" ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Security sx={{ fontSize: 16 }} />
                )
              }
              onClick={handleCreateAcl}
              disabled={acl.status === "creating"}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                whiteSpace: "nowrap",
                borderRadius: 1.5,
                px: 1.5,
                py: 0.5,
              }}
            >
              {acl.status === "creating" ? "Creating..." : "Add ACL"}
            </Button>
          </Stack>
        </Alert>
      </Collapse>
    </Box>
  );
};

export default AppNextStepsAlert;
