import { FunctionComponent } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Link as MuiLink,
  Grid,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import {
  People,
  Code,
  Storage,
  Schedule,
  Info,
  Terminal,
} from "@mui/icons-material";
import { JobInfo } from "../../types/jobs";
import Link from "../base/MuiLink";
import cronstrue from "cronstrue";
import MetadataKeyValue from "../metadata/MetadataKeyValue";
import JobEnvironmentVariables from "./JobEnvironmentVariables";
import InfoCard from "../base/InfoCard";
import KeyValueRow from "../base/KeyValueRow";

type JobInfoCardsProps = {
  jobInfo: JobInfo;
};

const JobInfoCards: FunctionComponent<JobInfoCardsProps> = ({ jobInfo }) => {
  const theme = useTheme();
  const { job } = jobInfo;

  const hasMetadataLabels =
    job.metadata.labels && job.metadata.labels.length > 0;
  const hasMetadataAnnotations =
    job.metadata.annotations && job.metadata.annotations.length > 0;
  const hasMetadata = hasMetadataLabels || hasMetadataAnnotations;

  const scheduleDescription = job.spec.schedule
    ? cronstrue.toString(job.spec.schedule)
    : null;

  return (
    <Grid container spacing={2.5}>
      {/* Schedule Info */}
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <InfoCard title="Schedule" icon={<Schedule fontSize="small" />}>
          <Stack divider={<Divider />}>
            <KeyValueRow
              label="Type"
              value={
                <Chip
                  label={job.spec.manual ? "Manual" : "Scheduled"}
                  size="small"
                  variant="outlined"
                  color={job.spec.manual ? "secondary" : "primary"}
                />
              }
            />
            {job.spec.schedule && !job.spec.manual && (
              <>
                <KeyValueRow
                  label="Cron Expression"
                  value={job.spec.schedule}
                  copyable={job.spec.schedule}
                />
                {scheduleDescription && (
                  <KeyValueRow
                    label="Schedule"
                    value={
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          maxWidth: 200,
                          textAlign: "right",
                        }}
                      >
                        {scheduleDescription}
                      </Typography>
                    }
                  />
                )}
              </>
            )}
            {job.spec.concurrencyPolicy && (
              <KeyValueRow
                label="Concurrency Policy"
                value={job.spec.concurrencyPolicy}
              />
            )}
          </Stack>
        </InfoCard>
      </Grid>
      {/* Workload Info */}
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <InfoCard title="Workload" icon={<Storage fontSize="small" />}>
          <Stack divider={<Divider />}>
            <KeyValueRow
              label="Image"
              value={
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {job.spec.container.image}
                </Typography>
              }
              copyable={job.spec.container.image}
            />
            {jobInfo.cluster && (
              <KeyValueRow
                label="Cluster"
                value={
                  <Chip
                    label={jobInfo.cluster}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                }
              />
            )}

            <KeyValueRow
              label="Pool"
              value={<Chip label={job.pool} size="small" variant="outlined" />}
            />

            <KeyValueRow label="Plan" value={job.plan.name} />
          </Stack>
        </InfoCard>
      </Grid>
      {/* Command */}
      {job.spec.container.command.length > 0 && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <InfoCard title="Command" icon={<Terminal fontSize="small" />}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                fontFamily: "monospace",
                fontSize: "0.85rem",
              }}
            >
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {job.spec.container.command.map((cmd, idx) => (
                  <Chip
                    key={idx}
                    label={cmd}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: "monospace" }}
                  />
                ))}
              </Stack>
            </Box>
          </InfoCard>
        </Grid>
      )}
      {/* Environment Variables */}
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <InfoCard
          title="Environment Variables"
          icon={<Code fontSize="small" />}
          collapsible
          defaultExpanded={false}
        >
          <JobEnvironmentVariables job={job.name} />
        </InfoCard>
      </Grid>
      {/* Ownership */}
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <InfoCard title="Ownership" icon={<People fontSize="small" />}>
          <Stack divider={<Divider />}>
            {job.description && (
              <Box py={0.75}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Description
                </Typography>
                <Typography variant="body2">{job.description}</Typography>
              </Box>
            )}
            <Box py={1}>
              <Typography variant="caption" color="text.secondary">
                Teams
              </Typography>
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                mt={0.5}
                useFlexGap
              >
                {job.teams?.map((team) => (
                  <Chip
                    key={team}
                    label={team === job.teamOwner ? `${team} (owner)` : team}
                    size="small"
                    variant={team === job.teamOwner ? "filled" : "outlined"}
                    color={team === job.teamOwner ? "primary" : "default"}
                    component={Link}
                    href={`/teams/${team}`}
                    clickable
                  />
                ))}
              </Stack>
            </Box>
            <KeyValueRow
              label="Created by"
              value={
                <MuiLink href={`mailto:${job.owner}`}>{job.owner}</MuiLink>
              }
              copyable={job.owner}
            />
          </Stack>
        </InfoCard>
      </Grid>
      {/* Metadata */}
      {hasMetadata && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <InfoCard
            title="Metadata"
            icon={<Info fontSize="small" />}
            collapsible
            defaultExpanded={true}
          >
            {hasMetadataLabels && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Labels
                </Typography>
                <MetadataKeyValue items={job.metadata.labels} />
              </Box>
            )}
            {hasMetadataAnnotations && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Annotations
                </Typography>
                <MetadataKeyValue items={job.metadata.annotations} />
              </Box>
            )}
          </InfoCard>
        </Grid>
      )}
    </Grid>
  );
};

export default JobInfoCards;
