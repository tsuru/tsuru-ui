import { FunctionComponent } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Grid,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import { People, Storage, Info } from "@mui/icons-material";
import { ServiceInstanceInfo } from "../../types/serviceInstance";
import Link from "../base/MuiLink";
import InfoCard from "../base/InfoCard";
import KeyValueRow from "../base/KeyValueRow";

type DBaaSInfoCardsProps = {
  serviceInstance: ServiceInstanceInfo;
};

const DBaaSInfoCards: FunctionComponent<DBaaSInfoCardsProps> = ({
  serviceInstance,
}) => {
  const theme = useTheme();

  const tags = serviceInstance.Tags || [];
  const hasCustomInfo =
    serviceInstance.CustomInfo &&
    Object.keys(serviceInstance.CustomInfo).length > 0;

  return (
    <Grid container spacing={2.5}>
      {/* Instance Info */}
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <InfoCard title="Instance" icon={<Storage fontSize="small" />}>
          <Stack divider={<Divider />}>
            {serviceInstance.Description && (
              <Box py={0.75}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Description
                </Typography>
                <Typography variant="body2">
                  {serviceInstance.Description}
                </Typography>
              </Box>
            )}
            {serviceInstance.PlanName && (
              <KeyValueRow
                label="Plan"
                value={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip
                      label={serviceInstance.PlanName}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Stack>
                }
              />
            )}
            {serviceInstance.PlanDescription && (
              <Box py={0.75}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Plan Description
                </Typography>
                <Typography variant="body2">
                  {serviceInstance.PlanDescription}
                </Typography>
              </Box>
            )}
            {serviceInstance.Pool && (
              <KeyValueRow
                label="Pool"
                value={
                  <Chip
                    label={serviceInstance.Pool}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                }
              />
            )}
          </Stack>
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
            {tags.length > 0 && (
              <Box py={1}>
                <Typography variant="caption" color="text.secondary">
                  Tags
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  flexWrap="wrap"
                  mt={1.5}
                  useFlexGap
                >
                  {tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
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
                {serviceInstance.Teams.map((team, idx) => (
                  <Chip
                    key={idx}
                    label={
                      team === serviceInstance.TeamOwner
                        ? `${team} (owner)`
                        : team
                    }
                    size="small"
                    variant={
                      team === serviceInstance.TeamOwner ? "filled" : "outlined"
                    }
                    color={
                      team === serviceInstance.TeamOwner ? "primary" : "default"
                    }
                    component={Link}
                    href={`/teams/${team}`}
                    clickable
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </InfoCard>
      </Grid>
      {/* Custom Info */}
      {hasCustomInfo && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <InfoCard
            title="Custom Info"
            icon={<Info fontSize="small" />}
            collapsible
            defaultExpanded={true}
          >
            <Stack divider={<Divider />}>
              {Object.entries(serviceInstance.CustomInfo).map(
                ([key, value]) => (
                  <KeyValueRow
                    key={key}
                    label={key}
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
                        {value}
                      </Typography>
                    }
                    copyable={value}
                  />
                )
              )}
            </Stack>
          </InfoCard>
        </Grid>
      )}
      {/* Parameters */}
      {serviceInstance.Parameters &&
        Object.keys(serviceInstance.Parameters).length > 0 && (
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <InfoCard
              title="Parameters"
              icon={<Storage fontSize="small" />}
              collapsible
              defaultExpanded={false}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  overflow: "auto",
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(serviceInstance.Parameters, null, 2)}
                </pre>
              </Box>
            </InfoCard>
          </Grid>
        )}
    </Grid>
  );
};

export default DBaaSInfoCards;
