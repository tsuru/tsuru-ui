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
  Circle,
  Timeline,
  CloudQueue,
  MoreVert,
  KeyboardArrowDown,
  Dns,
} from "@mui/icons-material";
import { RPaasInfo } from "../../types/rpaas";

type RPaaSHeaderProps = {
  rpaasInfo: RPaasInfo;
  service: string;
  instanceName: string;
  grafanaURL?: string;
  grafanaLongTermURL?: string;
  cloudProviderLogsLink?: string;
};

const getStatus = (rpaasInfo: RPaasInfo) => {
  const totalPods = rpaasInfo.pods?.length || 0;
  const readyPods = rpaasInfo.pods?.filter((p) => p.ready).length || 0;

  if (totalPods === 0) {
    return { status: "stopped", label: "No Pods", color: "default" as const };
  }

  if (readyPods === totalPods) {
    return { status: "healthy", label: "Healthy", color: "success" as const };
  }

  if (readyPods > 0) {
    return { status: "degraded", label: "Degraded", color: "warning" as const };
  }

  return { status: "unhealthy", label: "Unhealthy", color: "error" as const };
};

const StatusIcon: FunctionComponent<{ status: string }> = ({ status }) => {
  switch (status) {
    case "healthy":
      return <CheckCircle fontSize="small" />;
    case "degraded":
    case "unhealthy":
      return <Error fontSize="small" />;
    default:
      return <Circle fontSize="small" />;
  }
};

const RPaaSHeader: FunctionComponent<RPaaSHeaderProps> = ({
  rpaasInfo,
  service,
  instanceName,
  grafanaURL,
  grafanaLongTermURL,
  cloudProviderLogsLink,
}) => {
  const theme = useTheme();
  const status = getStatus(rpaasInfo);

  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const totalPods = rpaasInfo.pods?.length || 0;
  const readyPods = rpaasInfo.pods?.filter((p) => p.ready).length || 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const primaryAddress = rpaasInfo.addresses?.find(
    (a) => a.type === "cluster-external"
  );
  const externalURL = primaryAddress?.hostname || primaryAddress?.ip;

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
        {/* Left side - Instance identity */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.main,
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            <Dns />
          </Avatar>

          <Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>
                {instanceName}
              </Typography>
              <Tooltip title="Copy instance name">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(instanceName)}
                  sx={{ opacity: 0.6, "&:hover": { opacity: 1 }, p: 0.25 }}
                >
                  <ContentCopy sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Chip
                icon={<StatusIcon status={status.status} />}
                label={status.label}
                color={status.color}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  height: 20,
                  "& .MuiChip-label": { px: 0.75 },
                  "& .MuiChip-icon": { fontSize: 14 },
                }}
              />
              <Chip
                label={service}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 500,
                  height: 20,
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
              {rpaasInfo.pool && (
                <Chip
                  label={rpaasInfo.pool}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{
                    fontWeight: 500,
                    height: 20,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              )}
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
                status.color === "success"
                  ? "success.main"
                  : status.color === "error"
                  ? "error.main"
                  : "text.primary"
              }
            >
              {readyPods}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
              >
                /{totalPods}
              </Typography>
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              pods
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="More options">
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
            <MenuItem
              disabled={!grafanaURL}
              onClick={() => {
                if (grafanaURL) window.open(grafanaURL, "_blank");
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
              disabled={!grafanaLongTermURL}
              onClick={() => {
                if (grafanaLongTermURL)
                  window.open(grafanaLongTermURL, "_blank");
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

          {externalURL && (
            <Tooltip title="Open instance">
              <IconButton
                size="small"
                onClick={() =>
                  window.open(
                    externalURL.startsWith("http")
                      ? externalURL
                      : `https://${externalURL}`,
                    "_blank"
                  )
                }
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  p: 0.5,
                  "&:hover": { bgcolor: theme.palette.primary.dark },
                }}
              >
                <OpenInNew sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default RPaaSHeader;
