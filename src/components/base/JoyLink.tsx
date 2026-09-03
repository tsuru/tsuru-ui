import { FunctionComponent, ReactNode } from "react";

import { Link as RouterLink } from "react-router-dom";
import { Link as MaterialLink } from "@mui/material";
import { LinkProps as MaterialLinkProps } from "@mui/material/Link";

type LinkProps = MaterialLinkProps & {
  children: ReactNode;
};

const Link: FunctionComponent<LinkProps> = ({ children, href, ...props }) => {
  return (
    <MaterialLink component={RouterLink} to={href as string} {...props}>
      {children}
    </MaterialLink>
  );
};

export default Link;
