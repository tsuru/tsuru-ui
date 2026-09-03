import React from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { RPaasEvent } from "../../types/rpaas";
import time from "../../utils/time";

type RPaasK8sEventsListProps = {
  events: Array<RPaasEvent>;
};

const RPaasK8sEventsList = (props: RPaasK8sEventsListProps) => {
  return (
    <Table
      sx={{ width: "100%", tableLayout: "auto", marginBottom: "20px" }}
      size="small"
    >
      <TableHead>
        <TableRow>
          <TableCell>Type</TableCell>
          <TableCell>Reason</TableCell>
          <TableCell>Age</TableCell>
          <TableCell>Message</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.events.map((event, i) => (
          <TableRow hover key={i}>
            <TableCell component="th" scope="row">
              {event.type}
            </TableCell>
            <TableCell component="th" scope="row">
              {event.reason}
            </TableCell>
            <TableCell component="th" scope="row">
              {eventAge(event)}
            </TableCell>
            <TableCell component="th" scope="row">
              {event.message}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const eventAge = (event: RPaasEvent): string => {
  const age = time.humanSince(Date.now() - Date.parse(event.last));

  if (event.count > 1) {
    const firstAge = time.humanSince(Date.now() - Date.parse(event.first));

    return `${age} (x${event.count} over ${firstAge})`;
  }
  return age;
};

export default RPaasK8sEventsList;
