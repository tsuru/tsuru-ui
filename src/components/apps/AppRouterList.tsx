import { FunctionComponent } from "react";

import { AppRouter } from "../../types/app";
import { Link, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import CancelIcon from "@mui/icons-material/Cancel";

type AppRouterListProps = {
  routers: Array<AppRouter>;
};
const AppRouterList: FunctionComponent<AppRouterListProps> = (props) => {
  const addresses = props.routers
    .map((router) => router.addresses.map((address) => ({ address, router })))
    .flat();

  const routerElems = addresses.map((r, i) => (
    <ListItem key={i} disablePadding>
      <Link href={fixAddress(r.address)}>
        <ListItemText
          primary={r.address !== "" ? fixAddress(r.address) : ""}
          title={`router: ${r.router.name}`}
        />
      </Link>{" "}
      <AppRouterStatus
        routerName={r.router.name}
        status={r.router.status}
        statusDetail={r.router["status-detail"]}
      />
    </ListItem>
  ));

  return <List dense>{routerElems}</List>;
};

type AppRouterStatusProps = {
  routerName: string;
  status: string;
  statusDetail: string;
};
const AppRouterStatus = (props: AppRouterStatusProps) => {
  let statusText = `router ${props.routerName} is ${props.status}`;
  if (props.statusDetail) {
    statusText = `${statusText}: ${props.statusDetail}`;
  }

  if (props.status === "ready") {
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

export default AppRouterList;
