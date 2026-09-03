import React from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { RPaasCertificate } from "../../types/rpaas";

import time from "../../utils/time";
import { Tooltip } from "@mui/material";
import { SafetyCheck } from "@mui/icons-material";

type RPaasCertificatesListProps = {
  certificates: Array<RPaasCertificate>;
};

const RPaasCertificatesList = (props: RPaasCertificatesListProps) => {
  return (
    <Table sx={{ minWidth: 1024 }} size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Expires</TableCell>
          <TableCell>DNS Names</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.certificates.map((certificate, i) => (
          <TableRow hover key={i}>
            <TableCell component="td" scope="row">
              {certificate.Name}
              <RPaasCertificateManagedBy certificate={certificate} />
            </TableCell>
            <TableCell component="td" scope="row">
              {certificate.PublicKeyBitSize > 0
                ? time.humanDateWithWeek(certificate.ValidUntil)
                : ""}
            </TableCell>
            <TableCell component="td" scope="row">
              {certificate.DNSNames.join(", ")}
            </TableCell>
            <TableCell component="td" scope="row">
              {certificate.PublicKeyBitSize > 0 ? (
                `Active ${certificate.PublicKeyBitSize} bits ${certificate.PublicKeyAlgorithm} key`
              ) : (
                <span>
                  Pending
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const RPaasCertificateManagedBy = ({
  certificate,
}: {
  certificate: RPaasCertificate;
}) => {
  if (!certificate.IsManagedByCertManager) return null;
  return (
    <Tooltip
      title={`Cert manager issuer: ${certificate.CertManagerIssuer}`}
      placement="top"
    >
      <SafetyCheck color="success" />
    </Tooltip>
  );
};

export default RPaasCertificatesList;
