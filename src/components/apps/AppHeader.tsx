import { FunctionComponent, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  alpha,
  useTheme,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  OpenInNew,
  ContentCopy,
  CheckCircle,
  Error,
  Schedule,
  Circle,
  RestartAlt,
  PlayArrow,
  Stop,
  SwapVert,
  Timeline,
  CloudQueue,
  MoreVert,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { App } from "../../types/app";
import Link from "../base/MuiLink";
import config from "../../config";

type AppHeaderProps = {
  app: App;
};

const getAppStatus = (app: App) => {
  const totalUnits = app.units?.length || 0;
  const readyUnits = app.units?.filter((u) => u.Ready).length || 0;

  if (totalUnits === 0) {
    return { status: "stopped", label: "Stopped", color: "default" as const };
  }

  if (readyUnits === totalUnits) {
    return { status: "healthy", label: "Healthy", color: "success" as const };
  }

  if (readyUnits > 0) {
    return { status: "degraded", label: "Degraded", color: "warning" as const };
  }

  return { status: "unhealthy", label: "Unhealthy", color: "error" as const };
};

const StatusIcon: FunctionComponent<{ status: string }> = ({ status }) => {
  switch (status) {
    case "healthy":
      return <CheckCircle fontSize="small" />;
    case "degraded":
      return <Schedule fontSize="small" />;
    case "unhealthy":
      return <Error fontSize="small" />;
    default:
      return <Circle fontSize="small" />;
  }
};

const AppHeader: FunctionComponent<AppHeaderProps> = ({ app }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const appStatus = getAppStatus(app);
  const primaryAddress = app.routers?.[0]?.addresses?.[0];

  const [scaleMenuAnchor, setScaleMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const isStopped = app.units?.length === 0;

  const processes = new Set(app.units?.map((u) => u.ProcessName) || []);
  if (processes.size === 0) processes.add("web");

  const grafanaURL = config.grafanaURLForApp?.(app, false);
  const grafanaLongTerm = config.grafanaLongTermURLForApp?.(app);
  const cloudProviderLogsLink = config.cloudProviderLogsForAppUnit?.(app);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        borderRadius: 2,
        p: 1.5,
        mb: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        {/* Left side - App identity */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            {app.name.charAt(0).toUpperCase()}
          </Avatar>

          <Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>
                {app.name}
              </Typography>
              <Tooltip title="Copy app name">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(app.name)}
                  sx={{ opacity: 0.6, "&:hover": { opacity: 1 }, p: 0.25 }}
                >
                  <ContentCopy sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Chip
                icon={<StatusIcon status={appStatus.status} />}
                label={appStatus.label}
                color={appStatus.color}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  height: 20,
                  "& .MuiChip-label": { px: 0.75 },
                  "& .MuiChip-icon": { fontSize: 14 },
                }}
              />
              {app.platform && (
                <Chip
                  label={app.platform}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 500,
                    height: 20,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              )}
              <Chip
                label={app.pool}
                size="small"
                variant="outlined"
                color="secondary"
                sx={{
                  fontWeight: 500,
                  height: 20,
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            </Stack>
          </Box>
        </Stack>

        {/* Right side - Info and Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              textAlign: "center",
              px: 1,
              py: 0.25,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              component="span"
              color={
                appStatus.color === "success"
                  ? "success.main"
                  : appStatus.color === "error"
                  ? "error.main"
                  : "text.primary"
              }
            >
              {app.units?.filter((u) => u.Ready).length || 0}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
              >
                /{app.units?.length || 0}
              </Typography>
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              units
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              px: 1,
              py: 0.25,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={700} component="span">
              {app.quota.inuse}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
              >
                /{app.quota.limit}
              </Typography>
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              quota
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <ButtonGroup variant="contained" size="small">
            {isStopped ? (
              <Button
                startIcon={<PlayArrow sx={{ fontSize: 16 }} />}
                color="success"
                onClick={() => navigate(`/apps/${app.name}/start`)}
                sx={{ py: 0.25, px: 1, fontSize: "0.75rem" }}
              >
                Start
              </Button>
            ) : (
              <>
                <Button
                  startIcon={<RestartAlt sx={{ fontSize: 16 }} />}
                  onClick={() => navigate(`/apps/${app.name}/restart`)}
                  sx={{ py: 0.25, px: 1, fontSize: "0.75rem" }}
                >
                  Restart
                </Button>
              </>
            )}
          </ButtonGroup>

          {processes.size === 1 ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<SwapVert sx={{ fontSize: 16 }} />}
              onClick={() =>
                navigate(`/apps/${app.name}/scale/${Array.from(processes)[0]}`)
              }
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.5),
                py: 0.25,
                px: 1,
                fontSize: "0.75rem",
              }}
            >
              Scale
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SwapVert sx={{ fontSize: 16 }} />}
                endIcon={<KeyboardArrowDown sx={{ fontSize: 14 }} />}
                onClick={(e) => setScaleMenuAnchor(e.currentTarget)}
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  py: 0.25,
                  px: 1,
                  fontSize: "0.75rem",
                }}
              >
                Scale
              </Button>
              <Menu
                anchorEl={scaleMenuAnchor}
                open={Boolean(scaleMenuAnchor)}
                onClose={() => setScaleMenuAnchor(null)}
                transformOrigin={{ horizontal: "left", vertical: "top" }}
                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
              >
                {Array.from(processes).map((processName) => (
                  <MenuItem
                    key={processName}
                    onClick={() => {
                      navigate(`/apps/${app.name}/scale/${processName}`);
                      setScaleMenuAnchor(null);
                    }}
                  >
                    <ListItemIcon>
                      <SwapVert fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Scale {processName}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          <Tooltip title="More">
            <Button
              variant="outlined"
              size="small"
              endIcon={<KeyboardArrowDown sx={{ fontSize: 14 }} />}
              onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              sx={{
                borderColor: alpha(theme.palette.divider, 0.3),
                py: 0.25,
                px: 0.75,
                minWidth: "auto",
              }}
            >
              <MoreVert sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
          <Menu
            anchorEl={moreMenuAnchor}
            open={Boolean(moreMenuAnchor)}
            onClose={() => setMoreMenuAnchor(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {!isStopped && (
              <MenuItem
                sx={{ color: "error.main" }}
                onClick={() => navigate(`/apps/${app.name}/stop`)}
              >
                <ListItemIcon>
                  <Stop fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Stop</ListItemText>
              </MenuItem>
            )}
            <MenuItem
              disabled={!grafanaURL}
              onClick={() => {
                window.open(grafanaURL, "_blank");
                setMoreMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <Timeline fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Metrics</ListItemText>
              <OpenInNew fontSize="small" sx={{ ml: 1, opacity: 0.5 }} />
            </MenuItem>
            <MenuItem
              disabled={!grafanaLongTerm}
              onClick={() => {
                if (grafanaLongTerm) window.open(grafanaLongTerm, "_blank");
                setMoreMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <Timeline fontSize="small" />
              </ListItemIcon>
              <ListItemText>Long Term Metrics</ListItemText>
              <OpenInNew fontSize="small" sx={{ ml: 1, opacity: 0.5 }} />
            </MenuItem>
            <Divider />
            <MenuItem
              disabled={!cloudProviderLogsLink}
              onClick={() => {
                if (cloudProviderLogsLink)
                  window.open(cloudProviderLogsLink, "_blank");
                setMoreMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <CloudQueue fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cloud Provider Logs</ListItemText>
              <OpenInNew fontSize="small" sx={{ ml: 1, opacity: 0.5 }} />
            </MenuItem>
          </Menu>

          {primaryAddress && (
            <Tooltip title="Open application">
              <Link
                href={
                  primaryAddress.startsWith("http")
                    ? primaryAddress
                    : `http://${primaryAddress}`
                }
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
              >
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                    p: 0.5,
                    "&:hover": { bgcolor: theme.palette.primary.dark },
                  }}
                >
                  <OpenInNew sx={{ fontSize: 16 }} />
                </IconButton>
              </Link>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default AppHeader;
