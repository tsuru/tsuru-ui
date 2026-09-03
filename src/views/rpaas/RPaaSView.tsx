import { FunctionComponent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";

import {
  Box,
  Breadcrumbs,
  Typography,
  Paper,
  Fade,
  alpha,
  useTheme,
} from "@mui/material";
import { NavigateNext, Dns } from "@mui/icons-material";

import Loading from "../Loading";
import DisplayError from "../../components/base/DisplayError";
import Link from "../../components/base/MuiLink";
import config from "../../config";
import { useRPaaSInfo } from "../../hooks/rpaas";

// Sub-components
import RPaaSHeader from "../../components/rpaas/RPaaSHeader";
import RPaaSTabs, {
  RPaaSTabValue,
  rpaasViewTabs,
} from "../../components/rpaas/RPaaSTabs";
import RPaaSInfoCards from "../../components/rpaas/RPaaSInfoCards";

// Tab content components
import RPaasBindList from "../../components/rpaas/RPaasBindList";
import RPaasPodList from "../../components/rpaas/RPaasPodList";
import RPaasBlocks from "../../components/rpaas/RPaasBlocks";
import EventList from "../../components/events/EventList";
import RPaasK8sEventsList from "../../components/rpaas/RPaasK8sEventsList";
import RPaasLog from "../../components/rpaas/RPaasLog";

const GrafanaIframe: FunctionComponent<{ src: string }> = ({ src }) => {
  const theme = useTheme();

  // Remove any existing theme parameter and add the current one
  const grafanaSrcWithTheme = src
    ? src.replace(/[?&]theme=(light|dark)/g, "") +
      `&theme=${theme.palette.mode}`
    : "";

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <iframe
        key={theme.palette.mode}
        title="Grafana Metrics"
        style={{
          display: "block",
          background: theme.palette.mode === "dark" ? "#1a1a1a" : "#fafafa",
          border: "none",
          width: "100%",
          height: "calc(100vh - 340px)",
          minHeight: 500,
        }}
        src={grafanaSrcWithTheme}
      />
    </Box>
  );
};

type RPaaSViewProps = {
  service: string;
  title: string;
};

const RPaaSView: FunctionComponent<RPaaSViewProps> = (props) => {
  const theme = useTheme();
  const params = useParams();
  const instanceName = params.instanceName as string;

  const initialTab = (params.tab as RPaaSTabValue) || "resources";
  const [currentTab, setCurrentTab] = useState<RPaaSTabValue>(initialTab);

  const rpaasInfo = useRPaaSInfo(props.service, instanceName);

  useTitle(`${props.title}: ${instanceName}`);

  useEffect(() => {
    const newTab = (params.tab as RPaaSTabValue) || "resources";
    if (rpaasViewTabs[newTab]) {
      setCurrentTab((prev) => (newTab !== prev ? newTab : prev));
    }
  }, [params.tab]);

  const handleTabChange = (tab: RPaaSTabValue) => {
    window.history.replaceState(
      null,
      "",
      `${config.prefix}/services/${props.service}/${instanceName}/${tab}`
    );
    setCurrentTab(tab);
  };

  const grafanaURL = (iframe: boolean): string => {
    if (!rpaasInfo.value) return "";
    if (!rpaasInfo.value.cluster) return "";
    if (!config.grafanaURLForRPaaS) return "";

    return config.grafanaURLForRPaaS(
      rpaasInfo.value.cluster,
      props.service,
      instanceName,
      iframe
    );
  };

  const grafanaLongTermURL =
    rpaasInfo.value?.cluster && config.grafanaLongTermURLForRPaaS
      ? config.grafanaLongTermURLForRPaaS(
          rpaasInfo.value.cluster,
          props.service,
          instanceName
        )
      : undefined;

  const cloudProviderLogsLink =
    rpaasInfo.value?.pool && config.cloudProviderLogsForRPaaS
      ? config.cloudProviderLogsForRPaaS(
          rpaasInfo.value.pool,
          props.service,
          instanceName
        )
      : undefined;

  if (rpaasInfo.error) {
    return <DisplayError error={rpaasInfo.error} />;
  }

  if (rpaasInfo.loading || !rpaasInfo.value) {
    return <Loading />;
  }

  const bindCount = rpaasInfo.value.binds?.length || 0;
  const podCount = rpaasInfo.value.pods?.length || 0;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{
          mb: 3,
          "& .MuiBreadcrumbs-separator": {
            mx: 1,
          },
        }}
      >
        <Link
          href={`/services/${props.service}`}
          underline="hover"
          color="inherit"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Dns fontSize="small" />
          {props.title}
        </Link>
        <Typography
          color="text.primary"
          fontWeight={600}
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {instanceName}
        </Typography>
      </Breadcrumbs>

      {/* Header with instance info and status */}
      <Fade in timeout={300}>
        <Box>
          <RPaaSHeader
            rpaasInfo={rpaasInfo.value}
            service={props.service}
            instanceName={instanceName}
            grafanaURL={grafanaURL(false)}
            grafanaLongTermURL={grafanaLongTermURL}
            cloudProviderLogsLink={cloudProviderLogsLink}
          />
        </Box>
      </Fade>

      {/* Tabs Navigation */}
      <Fade in timeout={500}>
        <Box>
          <RPaaSTabs
            value={currentTab}
            onChange={handleTabChange}
            podCount={podCount}
            bindCount={bindCount}
          />
        </Box>
      </Fade>

      {/* Tab Content */}
      <Fade in timeout={600}>
        <Box>
          {currentTab === "resources" && (
            <GrafanaIframe src={grafanaURL(true)} />
          )}

          {currentTab === "info" && (
            <RPaaSInfoCards rpaasInfo={rpaasInfo.value} />
          )}

          {currentTab === "binds" && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <RPaasBindList binds={rpaasInfo.value.binds || []} />
            </Paper>
          )}

          {currentTab === "pods" && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <RPaasPodList
                service={props.service}
                pool={rpaasInfo.value.pool as string}
                instance={instanceName}
                pods={rpaasInfo.value.pods || []}
              />
            </Paper>
          )}

          {currentTab === "blocks" && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <RPaasBlocks
                blocks={rpaasInfo.value.blocks}
                routes={rpaasInfo.value.routes}
                extraFiles={rpaasInfo.value.extraFiles}
              />
            </Paper>
          )}

          {currentTab === "events" && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              {rpaasInfo.value.events && (
                <Box mb={3}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    mb={2}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    Kubernetes Events
                  </Typography>
                  <RPaasK8sEventsList events={rpaasInfo.value.events} />
                </Box>
              )}
              <Typography
                variant="subtitle1"
                fontWeight={600}
                mb={2}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                Tsuru Events
              </Typography>
              <EventList service={props.service + "/" + instanceName} />
            </Paper>
          )}

          {currentTab === "logs" && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: "calc(100vh - 380px)",
                minHeight: 400,
              }}
            >
              <RPaasLog
                pool={rpaasInfo.value.pool as string}
                service={props.service}
                instance={instanceName}
              />
            </Paper>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default RPaaSView;
