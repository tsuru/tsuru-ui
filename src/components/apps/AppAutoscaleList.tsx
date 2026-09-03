import React from "react";
import cronstrue from "cronstrue";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { AppAutoscale } from "../../types/app";
import resources from "../../utils/resources";
import Link from "../base/MuiLink";

type AppInternalAddressesListProps = {
  app: string;
  autoscale: Array<AppAutoscale>;
};

function Row(props: { app: string; autoscale: AppAutoscale }) {
  const { app, autoscale } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="open process scalers details"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {autoscale.process}
        </TableCell>
        <TableCell component="th" scope="row" align="right">
          {autoscale.minUnits}
        </TableCell>
        <TableCell component="th" scope="row" align="right">
          {autoscale.maxUnits}
        </TableCell>
        <TableCell component="th" scope="row" align="center">
          <Link
            href={`/apps/${app}/scale/${autoscale.process}`}
            underline="hover"
          >
            Edit
          </Link>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ marginLeft: { xs: 1, sm: 3 }, my: 1 }}>
              <Table
                size="small"
                aria-label="process scalers"
                sx={{ tableLayout: "auto" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Trigger</TableCell>
                    <TableCell>Trigger details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {autoscale.averageCPU && (
                    <TableRow>
                      <TableCell>CPU</TableCell>
                      <TableCell>
                        Target:{" "}
                        {resources.parseCPUToHuman(autoscale.averageCPU)}
                      </TableCell>
                    </TableRow>
                  )}
                  {autoscale.schedules &&
                    autoscale.schedules.map((schedule, i) => (
                      <TableRow key={i}>
                        <TableCell component="th" scope="row">
                          Schedule
                        </TableCell>
                        <TableCell>
                          {schedule.name && (
                            <>
                              <b>Name:</b> {schedule.name}
                              <br />
                            </>
                          )}
                          <b>Start:</b> {cronstrue.toString(schedule.start)} (
                          {schedule.start})<br />
                          <b>End:</b> {cronstrue.toString(schedule.end)} (
                          {schedule.end})<br />
                          <b>Units:</b> {schedule.minReplicas}
                          <br />
                          <b>Timezone:</b> {schedule.timezone}
                          <br />
                        </TableCell>
                      </TableRow>
                    ))}
                  {autoscale.prometheus &&
                    autoscale.prometheus.map((prometheus, i) => (
                      <TableRow key={i}>
                        <TableCell component="th" scope="row">
                          Prometheus
                        </TableCell>
                        <TableCell>
                          <b>Name:</b> {prometheus.name}
                          <br />
                          <b>Threshold:</b> {prometheus.threshold}
                          <br />
                          <b>Query:</b> {prometheus.query}
                          <br />
                          <b>PrometheusAddress:</b>{" "}
                          {prometheus.prometheusAddress}
                          <br />
                        </TableCell>
                      </TableRow>
                    ))}
                  {autoscale.behavior && (
                    <TableRow>
                      <TableCell>Scale Down</TableCell>
                      <TableCell>
                        <b>Percentage:</b>{" "}
                        {autoscale.behavior?.scaleDown?.percentagePolicyValue}
                        <br />
                        <b>Units:</b>{" "}
                        {autoscale.behavior?.scaleDown?.unitsPolicyValue}
                        <br />
                        {autoscale.behavior?.scaleDown?.stabilizationWindow && (
                          <>
                            <b>Stabilization Window:</b>{" "}
                            {autoscale.behavior?.scaleDown?.stabilizationWindow}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const AppAutoscaleList = (props: AppInternalAddressesListProps) => {
  return (
    <Table
      aria-label="autoscalers info"
      sx={{ width: "100%", tableLayout: "auto" }}
      size="small"
    >
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Process</TableCell>
          <TableCell align="right">Min Units</TableCell>
          <TableCell align="right">Max Units</TableCell>
          <TableCell align="right"></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.autoscale.map((autoscale, i) => (
          <Row key={i} app={props.app} autoscale={autoscale} />
        ))}
      </TableBody>
    </Table>
  );
};

export default AppAutoscaleList;
