import { FunctionComponent, useEffect, useRef, useState } from "react";
import { useFetch } from "../../contexts/auth";
import { useInterval } from "react-use";
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
import Streamer from "../../logStreamers/rpaas";
import { RPaasLogFilter } from "../../types/rpaas";
import config from "../../config";

type RPaasLogProps = {
  pool: string;
  service: string;
  instance: string;
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
  width: "200px",
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

const RPaasLog: FunctionComponent<RPaasLogProps> = (props) => {
  const fetch = useFetch();
  const [filter, setFilter] = useState<RPaasLogFilter>(initialFilter());
  const [count, setCount] = useState(0);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    if (streaming) {
      streamer.start({
        fetch,
        service: props.service,
        instance: props.instance,
        filter,
      });
    } else {
      if (
        !streamer.bufferPreviousPopulated({
          service: props.service,
          instance: props.instance,
          filter,
        })
      ) {
        streamer.fillBuffer({
          fetch,
          service: props.service,
          instance: props.instance,
          filter,
        });
      }
      streamer.stop();
    }

    return () => streamer.stop();
  }, [filter, fetch, streaming, props]);

  useEffect(() => {
    const a = new URLSearchParams(filter).toString();
    window.history.replaceState(null, "", `?${a}`);
  }, [filter]);

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
  if (config.cloudProviderLogsForRPaaS) {
    cloudProviderLog = config.cloudProviderLogsForRPaaS(
      props.pool,
      props.service,
      props.instance,
      filter.pod,
      filter.container
    );
  }

  let filteredLines = streamer.buffer;
  if (Object.keys(filter).length > 0) {
    filteredLines = filteredLines.filter((line) => {
      if (filter.pod && line.pod !== filter.pod) {
        return false;
      }

      if (filter.container && line.container !== filter.container) {
        return false;
      }

      return true;
    });
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        {Object.keys(filter).length > 0 && (
          <>
            {filter.pod && (
              <PrimaryLogChip
                size="small"
                label={`pod: ${filter.pod} ⅹ`}
                title="Clear filter"
                clickable
                onClick={() => setFilter({})}
              />
            )}
            {filter.container && (
              <SecondaryLogChip
                size="small"
                label={`container: ${filter.container} ⅹ`}
                title="Clear filter"
                clickable
                onClick={() => setFilter({})}
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
                <DateLogTableCell component="th" scope="header">
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
                  <DateLogTableCell component="td" scope="row">
                    {humanDate(line.date)}
                  </DateLogTableCell>
                  <MessageLogTableCell component="td" scope="row">
                    {!filter.pod && (
                      <PrimaryLogChip
                        size="small"
                        label={line.pod}
                        clickable
                        onClick={() => setFilter({ pod: line.pod })}
                      />
                    )}
                    {!filter.container && (
                      <SecondaryLogChip
                        size="small"
                        label={line.container}
                        clickable
                        onClick={() => setFilter({ container: line.container })}
                      />
                    )}{" "}
                    {line.message}
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
  const initialFilter: RPaasLogFilter = {};
  let value = initialParams.get("pod");
  if (value) {
    initialFilter.pod = value;
  }
  value = initialParams.get("container");
  if (value) {
    initialFilter.container = value;
  }

  return initialFilter;
};

export default RPaasLog;
