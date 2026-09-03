import { MetadataNameValue } from "../../types/metadata";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

type MetadataKeyValueProps = {
  items: Array<MetadataNameValue>;
};
const MetadataKeyValue = (props: MetadataKeyValueProps) => {
  return (
    <Table sx={{ width: "100%", tableLayout: "auto" }} size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.items.map((item, i) => (
          <TableRow hover key={i}>
            <TableCell component="th" scope="row">
              {item.name}
            </TableCell>
            <TableCell component="th" scope="row">
              {item.value}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MetadataKeyValue;
