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
import { NavigateNext, WorkOutline } from "@mui/icons-material";

import Loading from "../Loading";
import DisplayError from "../../components/base/DisplayError";
import Link from "../../components/base/MuiLink";
import config from "../../config";
import { useJobInfo } from "../../hooks/jobs";

// Sub-components
import JobHeader from "../../components/jobs/JobHeader";
import JobTabs, {
  JobTabValue,
  jobViewTabs,
} from "../../components/jobs/JobTabs";
import JobInfoCards from "../../components/jobs/JobInfoCards";

// Tab content components
import UnitList from "../../components/jobs/UnitList";
import BindList from "../../components/services/BindList";
import EventList from "../../components/events/EventList";
import TsuruLog from "../../components/logs/TsuruLog";

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

const JobView: FunctionComponent = () => {
  const theme = useTheme();
  const params = useParams();
  const jobId = params.id as string;

  const initialTab = (params.tab as JobTabValue) || "resources";
  const [currentTab, setCurrentTab] = useState<JobTabValue>(initialTab);

  const jobInfo = useJobInfo(jobId);

  useTitle(`Job: ${jobId}`);

  useEffect(() => {
    const newTab = (params.tab as JobTabValue) || "resources";
    if (jobViewTabs[newTab]) {
      setCurrentTab((prev) => (newTab !== prev ? newTab : prev));
    }
  }, [params.tab]);

  const handleTabChange = (tab: JobTabValue) => {
    window.history.replaceState(
      null,
      "",
      `${config.prefix}/jobs/${jobId}/${tab}`
    );
    setCurrentTab(tab);
  };

  const grafanaURL = (iframe: boolean): string => {
    if (!jobInfo.value) return "";
    if (!config.grafanaURLForJob) return "";

    return config.grafanaURLForJob(jobInfo.value, iframe);
  };

  if (jobInfo.error) {
    return <DisplayError error={jobInfo.error} />;
  }

  if (jobInfo.loading || !jobInfo.value) {
    return <Loading />;
  }

  const bindCount = jobInfo.value.serviceInstanceBinds?.length || 0;
  const unitCount = jobInfo.value.units?.length || 0;

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
          href="/jobs"
          underline="hover"
          color="inherit"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <WorkOutline fontSize="small" />
          Jobs
        </Link>
        <Typography
          color="text.primary"
          fontWeight={600}
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {jobId}
        </Typography>
      </Breadcrumbs>

      {/* Header with job info and status */}
      <Fade in timeout={300}>
        <Box>
          <JobHeader jobInfo={jobInfo.value} grafanaURL={grafanaURL(false)} />
        </Box>
      </Fade>

      {/* Tabs Navigation */}
      <Fade in timeout={500}>
        <Box>
          <JobTabs
            value={currentTab}
            onChange={handleTabChange}
            unitCount={unitCount}
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

          {currentTab === "info" && <JobInfoCards jobInfo={jobInfo.value} />}

          {currentTab === "binds" && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <BindList
                serviceInstanceBinds={jobInfo.value.serviceInstanceBinds || []}
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
              <UnitList units={jobInfo.value.units || []} />
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
              <EventList job={jobId} />
            </Paper>
          )}

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
              <TsuruLog job={jobInfo.value.job} />
            </Paper>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default JobView;
