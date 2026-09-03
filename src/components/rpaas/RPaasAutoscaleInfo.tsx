import cronstrue from "cronstrue";

import { RPaasAutoscale, RPaasAutoscaleSchedule } from "../../types/rpaas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

type RPaasAutoscaleInfoProps = {
  autoscale: RPaasAutoscale;
};
const RPaasAutoscaleInfo = ({ autoscale }: RPaasAutoscaleInfoProps) => {
  const parts: Array<string> = [];

  if (autoscale.cpu) {
    parts.push("target CPU: " + autoscale.cpu);
  }

  let scheduleTable = null;
  if (autoscale.schedules) {
    scheduleTable = (
      <RPaasAutoscaleScheduleList schedules={autoscale.schedules} />
    );
  }

  if (autoscale.rps) {
    parts.push("target RPS: " + autoscale.rps);
  }

  if (autoscale.memory) {
    parts.push("target Memory: " + autoscale.memory);
  }

  if (autoscale.minReplicas) {
    parts.push("min replicas: " + autoscale.minReplicas);
  }

  if (autoscale.maxReplicas) {
    parts.push("max replicas: " + autoscale.maxReplicas);
  }

  return (
    <>
      {scheduleTable}
      <span>{parts.join(", ")}</span>
    </>
  );
};

const RPaasAutoscaleScheduleList = ({
  schedules,
}: {
  schedules: Array<RPaasAutoscaleSchedule>;
}) => {
  return (
    <>
      <span>Schedule(s)</span>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Start</TableCell>
            <TableCell>End</TableCell>
            <TableCell>Min replicas</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.map((schedule, i) => (
            <TableRow hover key={i}>
              <TableCell component="th" scope="row">
                {cronstrue.toString(schedule.start) + ` (${schedule.start})`}
              </TableCell>
              <TableCell component="th" scope="row">
                {cronstrue.toString(schedule.end) + ` (${schedule.end})`}
              </TableCell>

              <TableCell component="th" scope="row">
                {schedule.minReplicas}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br />
    </>
  );
};

export default RPaasAutoscaleInfo;
