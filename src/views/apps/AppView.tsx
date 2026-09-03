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
  Button,
  Stack,
} from "@mui/material";
import { NavigateNext, Apps, Add } from "@mui/icons-material";

import Loading from "../Loading";
import DisplayError from "../../components/base/DisplayError";
import Link from "../../components/base/MuiLink";
import { useApp } from "../../hooks/app";
import config from "../../config";

// Sub-components
import AppHeader from "../../components/apps/AppHeader";
import AppNextStepsAlert from "../../components/apps/AppNextStepsAlert";
import AppTabs, {
  AppTabValue,
  appViewTabs,
} from "../../components/apps/AppTabs";
import AppInfoCards from "../../components/apps/AppInfoCards";

// Tab content components
import UnitList from "../../components/apps/UnitList";
import BindList from "../../components/services/BindList";
import DeployList from "../../components/deploys/DeployList";
import EventList from "../../components/events/EventList";
import TsuruLog from "../../components/logs/TsuruLog";
import ACLRulesPanel from "../../components/acls/ACLRulesPanel";

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

const AppView: FunctionComponent = () => {
  const theme = useTheme();
  const params = useParams();
  const appName = params.name as string;

  const initialTab = (params.tab as AppTabValue) || "resources";
  const [currentTab, setCurrentTab] = useState<AppTabValue>(initialTab);
  const [refresh, setRefresh] = useState<number>(0);
  const app = useApp(appName, refresh);

  useTitle(`App: ${appName}`);

  useEffect(() => {
    const newTab = (params.tab as AppTabValue) || "resources";
    if (appViewTabs[newTab]) {
      setCurrentTab((prev) => (newTab !== prev ? newTab : prev));
    }
  }, [params.tab]);

  const handleTabChange = (tab: AppTabValue) => {
    window.history.replaceState(
      null,
      "",
      `${config.prefix}/apps/${appName}/${tab}`
    );
    setCurrentTab(tab);
  };

  const grafanaURL = (iframe: boolean, refresh?: string) => {
    if (!app.value || !config.grafanaURLForApp) return "";
    let url = config.grafanaURLForApp(app.value, iframe);
    if (refresh) url += `&refresh=${refresh}`;
    return url;
  };

  const acls = app.value?.serviceInstanceBinds?.filter(
    (bind) => bind.service === "acl"
  );
  const containsACLTab = acls?.length === 1;

  if (app.error) {
    return <DisplayError error={app.error} />;
  }

  if (app.loading || !app.value) {
    return <Loading />;
  }

  const bindCount =
    (app.value.serviceInstanceBinds?.length || 0) +
    (app.value.volumeBinds?.length || 0);

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
          href="/apps"
          underline="hover"
          color="inherit"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Apps fontSize="small" />
          Apps
        </Link>
        <Typography
          color="text.primary"
          fontWeight={600}
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {appName}
        </Typography>
      </Breadcrumbs>

      {/* Header with app info and status */}
      <Fade in timeout={300}>
        <Box>
          <AppHeader app={app.value} />
        </Box>
      </Fade>

      {/* Next Steps Alerts */}
      <Fade in timeout={400}>
        <Box>
          <AppNextStepsAlert app={app.value} />
        </Box>
      </Fade>

      {/* Tabs Navigation */}
      <Fade in timeout={500}>
        <Box>
          <AppTabs
            value={currentTab}
            onChange={handleTabChange}
            unitCount={app.value.units?.length}
            bindCount={bindCount}
            containsACLTab={containsACLTab}
          />
        </Box>
      </Fade>

      {/* Tab Content */}
      <Fade in timeout={600}>
        <Box>
          {currentTab === "resources" && (
            <GrafanaIframe src={grafanaURL(true)} />
          )}

          {currentTab === "info" && <AppInfoCards app={app.value} />}

          {currentTab === "binds" && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  component={Link}
                  href={`/apps/${appName}/services/add`}
                >
                  Add Service Bind
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  component={Link}
                  href={`/apps/${appName}/volumes/add`}
                >
                  Add Volume Bind
                </Button>
              </Stack>
              <BindList
                serviceInstanceBinds={app.value.serviceInstanceBinds}
                volumeBinds={app.value.volumeBinds || []}
                appName={appName}
                onUnbind={() => setRefresh((prev) => prev + 1)}
              />
            </Paper>
          )}

          {currentTab === "acl" && containsACLTab && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <ACLRulesPanel
                service={acls[0].service}
                instanceName={acls[0].instance}
              />
            </Paper>
          )}

          {currentTab === "units" && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <UnitList
                app={app.value}
                units={app.value.units}
                unitsMetrics={app.value.unitsMetrics}
                onRefresh={() => {
                  setRefresh((prev) => prev + 1);
                }}
              />
            </Paper>
          )}

          {currentTab === "deploys" && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <DeployList app={app.value.name} />
            </Paper>
          )}

          {currentTab === "events" && <EventList app={app.value.name} />}

          {currentTab === "log" && (
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
              <TsuruLog app={app.value} />
            </Paper>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default AppView;
