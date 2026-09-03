import { FunctionComponent, ReactNode } from "react";
import { Link, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import { useAppCertificates } from "../../hooks/app";
import DisplayError from "../base/DisplayError";
import Loading from "../../views/Loading";
import { Https } from "@mui/icons-material";
import { AppCertificates, AppRouterCertificateCNAME } from "../../types/app";

type AppCNamesListProps = {
  app: string;
  cnames: Array<string>;
};

type AppRouterCertificateCNAMEWithRouter = AppRouterCertificateCNAME & {
  router: string;
};

const AppCNamesList: FunctionComponent<AppCNamesListProps> = (props) => {
  const appCertificates = useAppCertificates(props.app);

  let appCertificatesStateWidget: ReactNode = null;

  if (appCertificates.error) {
    appCertificatesStateWidget = <DisplayError error={appCertificates.error} />;
  } else if (appCertificates.loading) {
    appCertificatesStateWidget = <Loading />;
  }

  const cnameCertificates = infoByCNAME(appCertificates.value);

  const cnameElems = props.cnames.map((cname, i) => {
    let tlsIcons: Array<ReactNode> = [];
    let scheme = "http";

    if (cnameCertificates[cname]) {
      scheme = "https";
      tlsIcons = cnameCertificates[cname].map((e) => {
        return (
          <Tooltip title={cnameIssuerTitle(e)} placement="top">
            <Https color={e.certificate === "" ? "error" : "success"} />
          </Tooltip>
        );
      });
    }

    return (
      <ListItem key={i} disablePadding>
        <Link href={`${scheme}://${cname}`}>
          <ListItemText primary={cname} />
        </Link>
        {tlsIcons}
      </ListItem>
    );
  });

  return (
    <>
      <List dense>{cnameElems}</List>
      {appCertificatesStateWidget}
    </>
  );
};

const infoByCNAME = (appCertificates?: AppCertificates | null) => {
  const infoByCNAME: Record<
    string,
    Array<AppRouterCertificateCNAMEWithRouter>
  > = {};

  if (!appCertificates) {
    return infoByCNAME;
  }

  for (const router in appCertificates.routers) {
    const appRouter = appCertificates.routers[router];
    for (const cname in appRouter.cnames) {
      if (!infoByCNAME[cname]) {
        infoByCNAME[cname] = [];
      }

      infoByCNAME[cname].push({
        router,
        ...appRouter.cnames[cname],
      });
    }
  }

  return infoByCNAME;
};

const cnameIssuerTitle = (e: AppRouterCertificateCNAMEWithRouter) => {
  const parts: Array<string> = [`Certificate added on router ${e.router}`];

  if (e.issuer) {
    parts.push("Managed by cert-manager");
    parts.push(`Issued by: ${e.issuer}`);

    if (e.certificate === "") {
      parts.push("Not ready");
    }
  }

  return parts.join(", ");
};

export default AppCNamesList;
