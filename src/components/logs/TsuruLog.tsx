import { FunctionComponent, useEffect, useRef, useState } from "react";
import { useFetch } from "../../contexts/auth";
import { useInterval } from "react-use";
import { App, AppLogFilter } from "../../types/app";
import {
  Button,
  Chip,
  ChipProps,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  TableRowProps,
  createTheme,
  styled,
} from "@mui/material";
import { humanDate } from "../../utils/time";
import Streamer from "../../logStreamers/app";
import config from "../../config";
import { Job } from "../../types/jobs";

type TsuruLogProps = {
  app?: App;
  job?: Job;
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const LogTableRow = styled(TableRow)<TableRowProps>(() => ({
  backgroundColor: darkTheme.palette.background.default,

  ":hover td": {
    backgroundColor: darkTheme.palette.primary.contrastText,
  },
  td: {
    fontSize: "11px",
    fontFamily: "Monospace",
    color: darkTheme.palette.text.primary,
    borderBottomColor: darkTheme.palette.background.paper,
  },
}));

const DateLogTableCell = styled(TableCell)<TableCellProps>(() => ({
  width: "210px",
}));

const MessageLogTableCell = styled(TableCell)<TableCellProps>(() => ({
  wordBreak: "break-all",
  fontFamily: "Monospace",
}));

const PrimaryLogChip = styled(Chip)<ChipProps>(() => ({
  fontSize: "11px",
  lineHeight: "1.22",
  color: "var(--mui-palette-primary-contrastText)",
  backgroundColor: "var(--mui-palette-primary-light)",
  ":hover": {
    backgroundColor: "var(--mui-palette-primary-light)",
  },
}));

const SecondaryLogChip = styled(Chip)<ChipProps>(() => ({
  fontSize: "11px",
  lineHeight: "1.22",
  color: "var(--mui-palette-secondary-contrastText)",
  backgroundColor: "var(--mui-palette-secondary-light)",
  ":hover": {
    backgroundColor: "var(--mui-palette-secondary-light)",
  },
}));

const streamer = new Streamer();

const TsuruLog: FunctionComponent<TsuruLogProps> = (props) => {
  const fetch = useFetch();
  const [appLogFilter, setAppLogFilter] = useState<AppLogFilter>(
    initialFilter()
  );
  const [count, setCount] = useState(0);
  const [streaming, setStreaming] = useState(false);

  const appName = props.app?.name;
  const jobName = props.job?.name;

  useEffect(() => {
    if (streaming) {
      streamer.start({
        fetch,
        app: appName,
        job: jobName,
        appLogFilter,
      });
    } else {
      if (
        !streamer.bufferPreviousPopulated({
          app: appName,
          job: jobName,
          appLogFilter,
        })
      ) {
        streamer.fillBuffer({
          fetch,
          app: appName,
          job: jobName,
          appLogFilter,
        });
      }
      streamer.stop();
    }

    return () => streamer.stop();
  }, [appLogFilter, fetch, streaming, appName, jobName]);

  useEffect(() => {
    const a = new URLSearchParams(appLogFilter).toString();
    window.history.replaceState(null, "", `?${a}`);
  }, [appLogFilter]);

  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (tableRef.current && streaming) {
      tableRef.current.scrollIntoView({ block: "end" });
    }
  }, [count, streaming]);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  let cloudProviderLog = "";
  if (config.cloudProviderLogsForAppUnit && props.app) {
    cloudProviderLog = config.cloudProviderLogsForAppUnit(
      props.app,
      appLogFilter.unit
    );
  }

  if (config.cloudProviderLogsForJob && props.job) {
    cloudProviderLog = config.cloudProviderLogsForJob(props.job);
  }

  let filteredLines = streamer.buffer;
  if (Object.keys(appLogFilter).length > 0) {
    filteredLines = filteredLines.filter((line) => {
      if (appLogFilter.source && line.Source !== appLogFilter.source) {
        return false;
      }

      if (appLogFilter.unit && line.Unit !== appLogFilter.unit) {
        return false;
      }

      return true;
    });
  }

  const filterClickable = !!props.app;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        {Object.keys(appLogFilter).length > 0 && (
          <>
            {appLogFilter.source && !appLogFilter.unit && (
              <PrimaryLogChip
                size="small"
                label={`source: ${appLogFilter.source} ⅹ`}
                title="Clear filter"
                clickable={filterClickable}
                onClick={() => setAppLogFilter({})}
              />
            )}
            {appLogFilter.unit && (
              <SecondaryLogChip
                size="small"
                label={`unit: ${appLogFilter.unit} ⅹ`}
                title="Clear filter"
                clickable={filterClickable}
                onClick={() => setAppLogFilter({})}
              />
            )}
          </>
        )}

        <Button
          size="small"
          onClick={() => {
            if (streaming) {
              streamer.forceStop();
            }
            setStreaming(!streaming);
          }}
          variant="outlined"
          sx={{ marginLeft: "auto" }}
          color={streaming ? "error" : "primary"}
        >
          {streaming ? "Stop following logs to scroll" : "Follow logs"}
        </Button>

        <Button
          size="small"
          variant="outlined"
          color="primary"
          sx={{ marginLeft: "5px" }}
          href={cloudProviderLog}
          target="_blank"
          disabled={!cloudProviderLog}
        >
          View logs on Cloud Provider
        </Button>
      </div>

      {filteredLines.length > 0 && (
        <TableContainer
          sx={{
            height: "calc(100% - 15px)",
            width: "100%",
            overflowY: streaming ? "hidden" : null,
          }}
        >
          <Table
            size="small"
            padding="none"
            stickyHeader
            sx={{ tableLayout: "fixed" }}
            ref={tableRef}
          >
            <TableHead>
              <TableRow>
                <DateLogTableCell
                  component="th"
                  scope="header"
                  sx={{ paddingLeft: "10px" }}
                >
                  TIMESTAMP
                </DateLogTableCell>
                <MessageLogTableCell component="th" scope="header">
                  MESSAGE
                </MessageLogTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLines.map((line) => (
                <LogTableRow hover key={line.id}>
                  <DateLogTableCell
                    component="td"
                    scope="row"
                    sx={{ paddingLeft: "10px" }}
                  >
                    {humanDate(line.Date)}
                  </DateLogTableCell>
                  <MessageLogTableCell component="td" scope="row">
                    {!appLogFilter.source &&
                      !appLogFilter.unit &&
                      line.Source && (
                        <PrimaryLogChip
                          size="small"
                          label={line.Source}
                          clickable={filterClickable}
                          onClick={() =>
                            setAppLogFilter({ source: line.Source })
                          }
                        />
                      )}
                    {!appLogFilter.unit && (
                      <SecondaryLogChip
                        size="small"
                        label={line.Unit}
                        clickable={filterClickable}
                        onClick={() => setAppLogFilter({ unit: line.Unit })}
                      />
                    )}{" "}
                    {line.Message}
                  </MessageLogTableCell>
                </LogTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

const initialFilter = () => {
  const initialParams = new URLSearchParams(window.location.search);
  const initialFilter: AppLogFilter = {};
  let value = initialParams.get("unit");
  if (value) {
    initialFilter.unit = value;
  }
  value = initialParams.get("source");
  if (value) {
    initialFilter.source = value;
  }

  return initialFilter;
};

export default TsuruLog;
