import { FunctionComponent } from "react";

import {
  Alert,
  Link,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import CancelIcon from "@mui/icons-material/Cancel";
import { RPaasAddress } from "../../types/rpaas";

type RPaasAddressListProps = {
  addresses?: Array<RPaasAddress>;
};
const RPaasAddressList: FunctionComponent<RPaasAddressListProps> = (props) => {
  if (props.addresses == null) {
    return (
      <>
        <Alert severity="info">Addresses not available yet</Alert>
        <Alert severity="warning">
          If this takes too long, you might not have quota to create more RPaaS
        </Alert>
      </>
    );
  }

  const flatAddresses = props.addresses
    .map((a) => {
      if (a.hostname && a.hostname.includes(",")) {
        return a.hostname
          .split(",")
          .map((hostname) => Object.assign({}, a, { hostname }));
      }

      return [a];
    })
    .flat();

  const routerElems = flatAddresses.map((address, i) => (
    <ListItem key={i} disablePadding>
      <Link href={fixAddress(address.hostname || address.ip || "")}>
        <ListItemText
          primary={address.hostname || address.ip || ""}
          title={`type: ${address.type}`}
        />
      </Link>
      {address.ip ? ` (${address.ip}) ` : " "}
      <RPaasRouterStatus address={address} />
    </ListItem>
  ));

  return <List dense>{routerElems}</List>;
};

type RPaasRouterStatusProps = {
  address: RPaasAddress;
};

const RPaasRouterStatus = (props: RPaasRouterStatusProps) => {
  let statusText = `is a ready ${props.address.type} address`;

  if (props.address.status !== "ready") {
    statusText = `is ${props.address.status}`;
  }

  if (props.address.ip) {
    statusText += `, have IP: ${props.address.ip}`;
  }

  if (props.address.status === "ready") {
    return (
      <Tooltip title={statusText} placement="top">
        <BeenhereIcon color="success" />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={statusText} placement="top">
      <CancelIcon color="error" />
    </Tooltip>
  );
};

function fixAddress(address: string): string {
  if (!address.startsWith("http")) {
    return `http://${address}`;
  }

  return address;
}

export default RPaasAddressList;
