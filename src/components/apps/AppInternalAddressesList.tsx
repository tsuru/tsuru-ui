import React from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { AppInternalAddress } from "../../types/app";

type AppInternalAddressesListProps = {
  internalAddresses: Array<AppInternalAddress>;
};

const AppInternalAddressesList = (props: AppInternalAddressesListProps) => {
  let hasVersion = false;

  for (const internalAddress of props.internalAddresses) {
    if (internalAddress.Version) {
      hasVersion = true;
      break;
    }
  }

  return (
    <Table sx={{ width: "100%", tableLayout: "auto" }} size="small">
      <TableHead>
        <TableRow>
          <TableCell>Domain</TableCell>
          <TableCell>Port</TableCell>
          <TableCell>Process</TableCell>
          {hasVersion && <TableCell>Version</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {props.internalAddresses.map((internalAddress, i) => (
          <TableRow hover key={i}>
            <TableCell component="th" scope="row">
              {internalAddress.Domain}
            </TableCell>
            <TableCell component="th" scope="row">
              {internalAddress.Port}/{internalAddress.Protocol}
            </TableCell>
            <TableCell component="th" scope="row">
              {internalAddress.Process}
            </TableCell>
            {hasVersion && (
              <TableCell component="th" scope="row">
                {internalAddress.Version}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AppInternalAddressesList;
