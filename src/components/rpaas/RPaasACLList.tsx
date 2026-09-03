import React from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { RPaasAllowedUpstream } from "../../types/rpaas";

type RPaasACLListProps = {
  acls: Array<RPaasAllowedUpstream>;
};

const RPaasACLList = (props: RPaasACLListProps) => {
  return (
    <Table sx={{ width: "100%", tableLayout: "auto" }} size="small">
      <TableHead>
        <TableRow>
          <TableCell>Host</TableCell>
          <TableCell>Port</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.acls.map((acl, i) => (
          <TableRow hover key={i}>
            <TableCell component="th" scope="row">
              {acl.host}
            </TableCell>
            <TableCell component="th" scope="row">
              {acl.port}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RPaasACLList;
