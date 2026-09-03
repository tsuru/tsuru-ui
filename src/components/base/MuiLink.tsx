import { ReactNode, forwardRef } from "react";

import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { LinkProps as MuiLinkProps } from "@mui/material/Link";

type LinkProps = MuiLinkProps & {
  children: ReactNode;
};

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, href, ...props }, ref) => {
    return (
      <MuiLink ref={ref} component={RouterLink} to={href as string} {...props}>
        {children}
      </MuiLink>
    );
  }
);

export type { LinkProps };
export default Link;
