import { FunctionComponent, useState, useEffect } from "react";
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
  Public,
  Dns,
  Speed,
  People,
  Code,
  Storage,
  Link as LinkIcon,
  Info,
  Add,
} from "@mui/icons-material";
import { App } from "../../types/app";
import Link from "../base/MuiLink";
import config from "../../config";
import AppProcessList from "./AppProcessList";
import MetadataKeyValue from "../metadata/MetadataKeyValue";
import AppAutoscaleList from "./AppAutoscaleList";
import CodeBlock from "../base/CodeBlock";
import InfoCard from "../base/InfoCard";
import KeyValueRow from "../base/KeyValueRow";

type AppInfoCardsProps = {
  app: App;
};

const AppInfoCards: FunctionComponent<AppInfoCardsProps> = ({ app }) => {
  const theme = useTheme();

  const planByProcess: Record<string, string> = {};
  (app.processes || []).forEach((p) => (planByProcess[p.name] = p.plan));

  const hasMetadata =
    (app.metadata.labels && app.metadata.labels.length > 0) ||
    (app.metadata.annotations && app.metadata.annotations.length > 0);

  const fixAddress = (address: string) =>
    address.startsWith("http") ? address : `http://${address}`;

  return (
    <Grid container spacing={2.5}>
      {/* External Addresses */}
      {app.deploys > 0 && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <InfoCard
            title="External Addresses"
            icon={<Public fontSize="small" />}
          >
            <Stack spacing={1}>
              {app.routers?.map((router, idx) =>
                router.addresses.map((addr, addrIdx) => (
                  <Box
                    key={`${idx}-${addrIdx}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <LinkIcon fontSize="small" color="action" />
                    <MuiLink
                      href={fixAddress(addr)}
                      target="_blank"
                      rel="noopener"
                      sx={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {addr}
                    </MuiLink>
                    <Chip
                      label={router.status}
                      size="small"
                      color={router.status === "ready" ? "success" : "warning"}
                      variant="outlined"
                    />
                  </Box>
                ))
              )}
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  CNAMEs
                </Typography>
              </Divider>
              {app.cname &&
                app.cname.map((cname, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <Dns fontSize="small" color="action" />
                    <MuiLink
                      href={fixAddress(cname)}
                      target="_blank"
                      rel="noopener"
                      sx={{ flex: 1 }}
                    >
                      {cname}
                    </MuiLink>
                  </Box>
                ))}
              <Box sx={{ mt: 1 }}>
                <Link href={`/apps/${app.name}/cnames/add`}>
                  <Chip
                    icon={<Add />}
                    label="Add CNAME"
                    size="small"
                    color="primary"
                    variant="outlined"
                    clickable
                    sx={{ fontWeight: 500 }}
                  />
                </Link>
              </Box>
            </Stack>
          </InfoCard>
        </Grid>
      )}
      {/* Workload Info */}
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <InfoCard title="Workload" icon={<Storage fontSize="small" />}>
          <Stack divider={<Divider />}>
            {app.platform && (
              <KeyValueRow
                label="Platform"
                value={
                  <Link href={(config.platformGuides || {})[app.platform]}>
                    {app.platform}
                  </Link>
                }
              />
            )}
            {app.cluster && (
              <KeyValueRow
                label="Cluster"
                value={
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={app.cluster}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </Stack>
                }
              />
            )}

            <KeyValueRow
              label="Pool"
              value={
                <Stack direction="row" spacing={1}>
                  <Chip label={app.pool} size="small" variant="outlined" />
                </Stack>
              }
            />

            {Object.keys(planByProcess).length > 0 ? (
              <>
                <AppProcessList
                  plan={app.plan.name}
                  planByProcess={planByProcess}
                />
              </>
            ) : (
              <KeyValueRow label="Plan" value={app.plan.name} />
            )}
          </Stack>
        </InfoCard>
      </Grid>
      {/* Internal Addresses */}
      {app.internalAddresses && app.internalAddresses.length > 0 && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <InfoCard
            title="Internal Addresses"
            icon={<Dns fontSize="small" />}
            collapsible
            defaultExpanded={true}
          >
            <Stack spacing={1}>
              {app.internalAddresses.map((addr, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {addr.Domain}:{addr.Port}
                  </Typography>
                  <Stack direction="row" spacing={0.5} mt={0.5}>
                    <Chip
                      label={addr.Protocol}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={addr.Process}
                      size="small"
                      variant="outlined"
                    />
                    {addr.Version && (
                      <Chip
                        label={`v${addr.Version}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {addr.Port !== addr.TargetPort && (
                      <>
                        <Chip
                          label={`Access through port: ${addr.Port}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Container port: ${addr.TargetPort}`}
                          size="small"
                          variant="outlined"
                        />
                      </>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </InfoCard>
        </Grid>
      )}
      {/* Autoscale */}
      {app.autoscale && app.autoscale.length > 0 && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <InfoCard
            title="Autoscale"
            icon={<Speed fontSize="small" />}
            collapsible
          >
            <AppAutoscaleList app={app.name} autoscale={app.autoscale} />
          </InfoCard>
        </Grid>
      )}
      {/* Ownership */}
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <InfoCard title="Ownership" icon={<People fontSize="small" />}>
          <Stack divider={<Divider />}>
            {app.description && (
              <KeyValueRow label="Description" value={app.description} />
            )}
            {app.tags && app.tags.length > 0 && (
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
                  {app.tags.map((tag) => (
                    <Chip
                      key={tag}
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
                {app.teams.map((team) => (
                  <Chip
                    key={team}
                    label={team === app.teamowner ? `${team} (owner)` : team}
                    size="small"
                    variant={team === app.teamowner ? "filled" : "outlined"}
                    color={team === app.teamowner ? "primary" : "default"}
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
                <MuiLink href={`mailto:${app.owner}`}>{app.owner}</MuiLink>
              }
              copyable={app.owner}
            />
          </Stack>
        </InfoCard>
      </Grid>
      {/* Metadata */}
      {hasMetadata && (
        <Grid size={6}>
          <InfoCard
            title="Metadata"
            icon={<Info fontSize="small" />}
            collapsible
            defaultExpanded={true}
          >
            {app.metadata.labels && app.metadata.labels.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Labels
                </Typography>
                <MetadataKeyValue items={app.metadata.labels} />
              </Box>
            )}
            {app.metadata.annotations &&
              app.metadata.annotations.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Annotations
                  </Typography>
                  <MetadataKeyValue items={app.metadata.annotations} />
                </Box>
              )}
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
        >
          <Typography variant="body2" color="text.secondary">
            Configure environment variables for your application.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Link href={`/apps/${app.name}/envs`}>
              <Chip
                label="Open Environment Variables"
                color="primary"
                clickable
                sx={{ fontWeight: 500 }}
              />
            </Link>
          </Box>
        </InfoCard>
      </Grid>
      {/* Outbound IPs */}
      {config.outBoundIPs && app.cluster && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <InfoCard title="Outbound IPs" icon={<Code fontSize="small" />}>
            <OutboundIPsCard app={app} />
          </InfoCard>
        </Grid>
      )}
    </Grid>
  );
};

const OutboundIPsCard: FunctionComponent<{ app: App }> = ({ app }) => {
  const [code, setCode] = useState<string>("Loading...");

  useEffect(() => {
    const fetchOutboundIPs = async () => {
      if (!config.outBoundIPs) return;
      if (!app.cluster) return;

      try {
        const code = await config.outBoundIPs(app.cluster);
        setCode(code);
      } catch (error) {
        setCode(
          "Failed to load outbound IPs." +
            (error instanceof Error ? error.message : "")
        );
      }
    };
    fetchOutboundIPs();
  }, [app.cluster]);

  if (!config.outBoundIPs) {
    return null;
  }

  return (
    <CodeBlock
      title="All internet traffic originating from your application will use these IPs
              via network address translation (NAT)."
      language="markdown"
      code={code}
    />
  );
};

export default AppInfoCards;
