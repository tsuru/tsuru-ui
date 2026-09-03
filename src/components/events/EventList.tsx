import React, { FunctionComponent, useState } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import { eventsPerPage, getOwnerString } from "../../types/events";
import {
  Button,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import Link from "../base/MuiLink";
import { LinkProps } from "../base/MuiLink";
import { styled } from "@mui/material/styles";
import time from "../../utils/time";
import EventChip from "./EventChip";
import DisplayError from "../base/DisplayError";
import Loading from "../../views/Loading";
import { useTsuruEventKinds, useTsuruEventsPage } from "../../hooks/events";
import { useDebounce } from "react-use";

type EventListProps = {
  job?: string;
  app?: string;
  service?: string;
  kind?: string;
};

const TableRowLink = styled(Link)<LinkProps>(() => ({
  "::before": {
    content: "''",
    display: "block",
    position: "absolute",
    left: 0,
    width: "100%",
    height: "2em",
  },
}));

type EventFilterParms = {
  kind: string;
  owner: string;
  target: string;
};

const EventList: FunctionComponent<EventListProps> = (props) => {
  const [orderColumn, setOrderColumn] = useState<
    "starttime" | "kind" | "owner" | "target"
  >("starttime");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [eventFilterParams, setEventFilterParams] = useState<EventFilterParms>({
    kind: "",
    owner: "",
    target: "",
  });

  const events = useTsuruEventsPage(
    page,
    orderColumn,
    orderDirection,
    {
      app: props.app,
      job: props.job,
      service: props.service,
      kind: eventFilterParams.kind ? eventFilterParams.kind : props.kind,
      genericTarget: eventFilterParams.target,
      owner: eventFilterParams.owner,
    },
    [eventFilterParams]
  );

  const hasNext = (events.value || []).length >= eventsPerPage;

  const toogleSort = (column: "kind" | "owner" | "starttime" | "target") => {
    if (column === orderColumn) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
      return;
    }

    setOrderColumn(column);
    setOrderDirection("asc");
  };

  const hasTargetLabel = !(props.app || props.service);

  return (
    <>
      <EventsFilter
        showTarget={!(props.app || props.job || props.service)}
        onChange={(p) => {
          setEventFilterParams(p);
        }}
      />
      {events.error ? <DisplayError error={events.error} /> : null}
      {events.loading ? <Loading /> : null}
      {!events.loading && !events.error && events.value ? (
        <TableContainer component={Paper}>
          <Table sx={{ width: "100%", tableLayout: "auto" }}>
            <TableHead>
              <TableRow>
                <TableCell variant="head">
                  <TableSortLabel
                    active={orderColumn === "kind"}
                    direction={
                      orderColumn === "kind" ? orderDirection : undefined
                    }
                    onClick={() => toogleSort("kind")}
                  >
                    Action
                  </TableSortLabel>
                </TableCell>
                {hasTargetLabel && (
                  <TableCell variant="head">
                    <TableSortLabel
                      active={orderColumn === "target"}
                      direction={
                        orderColumn === "target" ? orderDirection : undefined
                      }
                      onClick={() => toogleSort("target")}
                    >
                      Target
                    </TableSortLabel>
                  </TableCell>
                )}

                <TableCell variant="head">
                  <TableSortLabel
                    active={orderColumn === "owner"}
                    direction={
                      orderColumn === "owner" ? orderDirection : undefined
                    }
                    onClick={() => toogleSort("owner")}
                  >
                    Owner
                  </TableSortLabel>
                </TableCell>
                <TableCell variant="head">
                  <TableSortLabel
                    active={orderColumn === "starttime"}
                    direction={
                      orderColumn === "starttime" ? orderDirection : undefined
                    }
                    onClick={() => toogleSort("starttime")}
                  >
                    Start
                  </TableSortLabel>
                </TableCell>
                <TableCell variant="head" />
              </TableRow>
            </TableHead>
            <TableBody>
              {events.value.map((event) => {
                let link = `/events/${event.UniqueID}`;

                if (props.app) {
                  link = `/apps/${props.app}${link}`;
                }

                return (
                  <TableRow hover key={event.UniqueID}>
                    <TableCell>
                      <TableRowLink
                        href={link}
                        underline="none"
                        color="inherit"
                      >
                        {event.Kind.Name} <EventChip event={event} />
                      </TableRowLink>
                    </TableCell>
                    {hasTargetLabel && (
                      <TableCell>
                        {event.Target.Type}: {event.Target.Value}
                      </TableCell>
                    )}
                    <TableCell>{getOwnerString(event)}</TableCell>
                    <TableCell>
                      {time.humanDateWithWeek(event.StartTime)}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {event.Running && (
                        <Tooltip title="Cancel this running event">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            href={`/events/${event.UniqueID}/cancel`}
                            component={Link}
                            onClick={(e: React.MouseEvent) =>
                              e.stopPropagation()
                            }
                          >
                            Cancel
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            count={hasNext ? page + 1 : page}
            siblingCount={0}
            onChange={(_, page) => {
              setPage(page);
            }}
          />
        </TableContainer>
      ) : null}
    </>
  );
};

const EventsFilter = ({
  showTarget,
  onChange,
}: {
  showTarget: boolean;
  onChange: (p: EventFilterParms) => void;
}) => {
  const [kind, setKind] = useState("*");
  const [owner, setOwner] = useState("");
  const [target, setTarget] = useState("");
  useDebounce(
    () => {
      onChange({ kind: kind !== "*" ? kind : "", owner, target });
    },
    1000,
    [target, owner, kind]
  );
  const kinds = useTsuruEventKinds();

  if (kinds.error) {
    return <DisplayError error={kinds.error} />;
  }

  if (kinds.loading || !kinds.value) {
    return <Loading />;
  }

  return (
    <Stack direction="row" spacing={1}>
      <div>
        <Select
          value={kind}
          label="Kind"
          size="small"
          onChange={(e) => {
            setKind(e.target.value);
          }}
        >
          <MenuItem value={"*"}>All</MenuItem>
          {kinds.value.map((kind) => (
            <MenuItem key={kind.Name} value={kind.Name}>
              {kind.Name}
            </MenuItem>
          ))}
        </Select>
      </div>

      <TextField
        label="Owner"
        onChange={(e) => setOwner(e.target.value)}
        size="small"
      />

      {showTarget ? (
        <TextField
          label="Target"
          onChange={(e) => setTarget(e.target.value)}
          size="small"
        />
      ) : null}
    </Stack>
  );
};

export default EventList;
