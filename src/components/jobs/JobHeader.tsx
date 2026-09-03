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
  WorkOutline,
  Schedule,
  PlayArrow,
} from "@mui/icons-material";
import { JobInfo } from "../../types/jobs";
import cronstrue from "cronstrue";

type JobHeaderProps = {
  jobInfo: JobInfo;
  grafanaURL?: string;
};

const getJobStatus = (jobInfo: JobInfo) => {
  const totalUnits = jobInfo.units?.length || 0;
  const succeededUnits =
    jobInfo.units?.filter((u) => u.Status === "succeeded").length || 0;
  const failedUnits =
    jobInfo.units?.filter((u) => u.Status === "error").length || 0;

  if (totalUnits === 0) {
    return { status: "idle", label: "Idle", color: "default" as const };
  }

  if (failedUnits > 0) {
    return { status: "failed", label: "Has Failures", color: "error" as const };
  }

  if (succeededUnits === totalUnits) {
    return {
      status: "completed",
      label: "Completed",
      color: "success" as const,
    };
  }

  return { status: "running", label: "Running", color: "warning" as const };
};

const StatusIcon: FunctionComponent<{ status: string }> = ({ status }) => {
  switch (status) {
    case "completed":
      return <CheckCircle fontSize="small" />;
    case "failed":
      return <Error fontSize="small" />;
    case "running":
      return <Schedule fontSize="small" />;
    default:
      return <Circle fontSize="small" />;
  }
};

const JobHeader: FunctionComponent<JobHeaderProps> = ({
  jobInfo,
  grafanaURL,
}) => {
  const theme = useTheme();
  const { job } = jobInfo;
  const jobStatus = getJobStatus(jobInfo);

  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const scheduleDescription = job.spec.schedule
    ? cronstrue.toString(job.spec.schedule)
    : null;

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.info.main,
          0.05
        )} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
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
        {/* Left side - Job identity */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            <WorkOutline />
          </Avatar>

          <Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>
                {job.name}
              </Typography>
              <Tooltip title="Copy job name">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(job.name)}
                  sx={{ opacity: 0.6, "&:hover": { opacity: 1 }, p: 0.25 }}
                >
                  <ContentCopy sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Chip
                icon={<StatusIcon status={jobStatus.status} />}
                label={jobStatus.label}
                color={jobStatus.color}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  height: 20,
                  "& .MuiChip-label": { px: 0.75 },
                  "& .MuiChip-icon": { fontSize: 14 },
                }}
              />
              {job.spec.manual ? (
                <Chip
                  icon={<PlayArrow sx={{ fontSize: 12 }} />}
                  label="Manual"
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{
                    fontWeight: 500,
                    height: 20,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              ) : (
                <Chip
                  icon={<Schedule sx={{ fontSize: 12 }} />}
                  label="Scheduled"
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
                label={job.pool}
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
            {scheduleDescription && !job.spec.manual && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.25, display: "block" }}
              >
                {scheduleDescription}
              </Typography>
            )}
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
              {jobInfo.units?.length || 0}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              runs
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
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};

export default JobHeader;
