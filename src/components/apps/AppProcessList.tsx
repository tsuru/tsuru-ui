import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const AppProcessList = ({
  planByProcess,
  plan,
}: {
  planByProcess: Record<string, string>;
  plan: string;
}) => {
  return (
    <Table sx={{ width: "100%", tableLayout: "auto" }} size="small">
      <TableHead>
        <TableRow>
          <TableCell>Process</TableCell>
          <TableCell>Plan</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow hover key="default">
          <TableCell component="th" scope="row">
            (default)
          </TableCell>
          <TableCell component="th" scope="row">
            {plan}
          </TableCell>
        </TableRow>
        {Object.keys(planByProcess)
          .sort()
          .map((process, i) => (
            <TableRow hover key={i}>
              <TableCell component="th" scope="row">
                {process}
              </TableCell>
              <TableCell component="th" scope="row">
                {planByProcess[process]}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default AppProcessList;
