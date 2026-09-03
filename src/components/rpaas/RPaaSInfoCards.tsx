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
  Public,
  Dns,
  Speed,
  People,
  Storage,
  Link as LinkIcon,
  Security,
  VerifiedUser,
  Settings,
} from "@mui/icons-material";
import { RPaasInfo } from "../../types/rpaas";
import Link from "../base/MuiLink";
import RPaasAutoscaleInfo from "./RPaasAutoscaleInfo";
import CodeBlock from "../base/CodeBlock";
import RPaasCertificatesList from "./RPaasCertificatesList";
import InfoCard from "../base/InfoCard";
import KeyValueRow from "../base/KeyValueRow";

type RPaaSInfoCardsProps = {
  rpaasInfo: RPaasInfo;
};

const RPaaSInfoCards: FunctionComponent<RPaaSInfoCardsProps> = ({
  rpaasInfo,
}) => {
  const theme = useTheme();

  // Filter empty tags
  const tags = (rpaasInfo.tags || []).filter((t) => t.length > 0);

  return (
    <Grid container spacing={2.5}>
      {/* External Addresses */}
      {rpaasInfo.addresses && rpaasInfo.addresses.length > 0 && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <InfoCard title="Addresses" icon={<Public fontSize="small" />}>
            <Stack spacing={1}>
              {rpaasInfo.addresses.map((addr, idx) => (
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
                  <LinkIcon fontSize="small" color="action" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {addr.hostname ? (
                      <MuiLink
                        href={`https://${addr.hostname}`}
                        target="_blank"
                        rel="noopener"
                        sx={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {addr.hostname}
                      </MuiLink>
                    ) : addr.ip ? (
                      <Typography variant="body2">{addr.ip}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {addr.serviceName || addr.ingressName || "Unknown"}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <Chip
                      label={addr.type}
                      size="small"
                      color={
                        addr.type === "cluster-external" ? "primary" : "default"
                      }
                      variant="outlined"
                    />
                    <Chip
                      label={addr.status}
                      size="small"
                      color={addr.status === "ready" ? "success" : "warning"}
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              ))}
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
            {rpaasInfo.image && (
              <KeyValueRow
                label="Image"
                value={
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {rpaasInfo.image}
                  </Typography>
                }
                copyable={rpaasInfo.image}
              />
            )}
            {rpaasInfo.replicas !== undefined && (
              <KeyValueRow label="Replicas" value={rpaasInfo.replicas} />
            )}
            {rpaasInfo.pool && (
              <KeyValueRow
                label="Pool"
                value={
                  <Chip
                    label={rpaasInfo.pool}
                    size="small"
                    variant="outlined"
                  />
                }
              />
            )}
            {rpaasInfo.cluster && (
              <KeyValueRow
                label="Cluster"
                value={
                  <Chip
                    label={rpaasInfo.cluster}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                }
              />
            )}
            {rpaasInfo.plan && (
              <KeyValueRow
                label="Plan"
                value={
                  <Link
                    href={`/services/${rpaasInfo.service}/plans/${rpaasInfo.plan}`}
                  >
                    {rpaasInfo.plan}
                  </Link>
                }
              />
            )}
            {rpaasInfo.flavors && rpaasInfo.flavors.length > 0 && (
              <Box py={0.75}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Flavors
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {rpaasInfo.flavors
                    .filter((f) => f && f.length > 0)
                    .map((flavor, idx) => (
                      <Chip
                        key={idx}
                        label={flavor}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </InfoCard>
      </Grid>
      {/* Certificates */}
      {rpaasInfo.certificates && rpaasInfo.certificates.length > 0 && (
        <Grid
          size={{
            xs: 12,
            md: 12,
          }}
        >
          <InfoCard
            title="Certificates"
            icon={<VerifiedUser fontSize="small" />}
            collapsible
          >
            <RPaasCertificatesList certificates={rpaasInfo.certificates} />
          </InfoCard>
        </Grid>
      )}
      {/* ACLs */}
      {rpaasInfo.acls && rpaasInfo.acls.length > 0 && (
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <InfoCard title="ACLs" icon={<Security fontSize="small" />}>
            <Stack spacing={1}>
              {rpaasInfo.acls.map((acl, idx) => (
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
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {acl.host}
                  </Typography>
                  <Chip
                    label={`Port ${acl.port}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Stack>
          </InfoCard>
        </Grid>
      )}
      {/* Autoscale */}
      {rpaasInfo.autoscale && (
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
            <RPaasAutoscaleInfo autoscale={rpaasInfo.autoscale} />
          </InfoCard>
        </Grid>
      )}
      {/* Plan Override */}
      {rpaasInfo.planOverride &&
        Object.keys(rpaasInfo.planOverride).length > 0 && (
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <InfoCard
              title="Plan Override"
              icon={<Settings fontSize="small" />}
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
                <CodeBlock
                  code={JSON.stringify(rpaasInfo.planOverride, null, 2)}
                  language="json"
                />
              </Box>
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
            {rpaasInfo.description && (
              <Box py={0.75}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Description
                </Typography>
                <Typography variant="body2">{rpaasInfo.description}</Typography>
              </Box>
            )}
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
                Team
              </Typography>
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                mt={0.5}
                useFlexGap
              >
                <Chip
                  label={`${rpaasInfo.team} (owner)`}
                  size="small"
                  variant="filled"
                  color="primary"
                  component={Link}
                  href={`/teams/${rpaasInfo.team}`}
                  clickable
                />
              </Stack>
            </Box>
          </Stack>
        </InfoCard>
      </Grid>
    </Grid>
  );
};

export default RPaaSInfoCards;
