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
  MoreVert,
  KeyboardArrowDown,
  Storage,
  Settings,
} from "@mui/icons-material";
import { ServiceInstanceInfo } from "../../types/serviceInstance";

type DBaaSHeaderProps = {
  serviceInstance: ServiceInstanceInfo;
  service: string;
  instanceName: string;
  status?: string;
  grafanaURL?: string;
  dbaasAdminLink?: string;
};

const getStatus = (status?: string) => {
  if (!status) {
    return { status: "unknown", label: "Unknown", color: "default" as const };
  }

  if (status.endsWith("is up")) {
    return { status: "healthy", label: "Healthy", color: "success" as const };
  }

  if (status.endsWith("is down")) {
    return { status: "unhealthy", label: "Unhealthy", color: "error" as const };
  }

  return { status: "unknown", label: "Unknown", color: "default" as const };
};

const StatusIcon: FunctionComponent<{ status: string }> = ({ status }) => {
  switch (status) {
    case "healthy":
      return <CheckCircle fontSize="small" />;
    case "unhealthy":
      return <Error fontSize="small" />;
    default:
      return <Circle fontSize="small" />;
  }
};

const DBaaSHeader: FunctionComponent<DBaaSHeaderProps> = ({
  serviceInstance,
  service,
  instanceName,
  status,
  grafanaURL,
  dbaasAdminLink,
}) => {
  const theme = useTheme();
  const instanceStatus = getStatus(status);

  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const appCount = serviceInstance.Apps?.length || 0;
  const jobCount = serviceInstance.Jobs?.length || 0;

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.warning.main,
          0.05
        )} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
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
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.main,
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            <Storage />
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
                icon={<StatusIcon status={instanceStatus.status} />}
                label={instanceStatus.label}
                color={instanceStatus.color}
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
              {serviceInstance.PlanName && (
                <Chip
                  label={serviceInstance.PlanName}
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
            <Typography variant="body2" fontWeight={700} component="span">
              {appCount}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              apps
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
              {jobCount}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              jobs
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
              disabled={!dbaasAdminLink}
              onClick={() => {
                if (dbaasAdminLink) window.open(dbaasAdminLink, "_blank");
                setMoreMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Manage on DBaaS</ListItemText>
              <OpenInNew fontSize="small" sx={{ ml: 1, opacity: 0.5 }} />
            </MenuItem>
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
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};

export default DBaaSHeader;
