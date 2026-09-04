import React, { FunctionComponent } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Tooltip from "@mui/material/Tooltip";
import AppsIcon from "@mui/icons-material/Apps";
import ServiceIcon from "./ServiceIcon";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import EventIcon from "@mui/icons-material/Event";
import FolderIcon from "@mui/icons-material/Folder";
import ScheduleIcon from "@mui/icons-material/Schedule";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import PeopleIcon from "@mui/icons-material/People";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import PersonIcon from "@mui/icons-material/Person";
import PinIcon from "@mui/icons-material/Pin";
import HttpIcon from "@mui/icons-material/Http";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import LanIcon from "@mui/icons-material/Lan";
import { DocumentScanner, NetworkCheck, Shop } from "@mui/icons-material";
import config from "../../config";
import Link from "./MuiLink";
import { useLocation } from "react-router-dom";

export const drawerWidth = 230;
export const drawerClosedWidth = 70;

type TsuruSidebarProps = {
  expanded: boolean;
};

// ---- NavLink ----

interface NavLinkProps {
  title: string;
  path: string;
  icon: React.ReactNode;
  sidebarExpanded: boolean;
  exact?: boolean;
  alsoMatch?: string;
  external?: boolean;
  indent?: boolean;
}

const NavLink: FunctionComponent<NavLinkProps> = ({
  title,
  path,
  icon,
  sidebarExpanded,
  exact,
  alsoMatch,
  external,
  indent,
}) => {
  const location = useLocation();
  const isActive =
    (exact ? location.pathname === path : location.pathname.startsWith(path)) ||
    (alsoMatch ? location.pathname === alsoMatch : false);

  return (
    <ListItemButton
      href={path}
      LinkComponent={Link}
      selected={isActive}
      target={external ? "_blank" : undefined}
      sx={{
        px: 1.5,
        py: 0.75,
        mx: 1,
        mb: 0.25,
        borderRadius: 1,
        ...(indent && sidebarExpanded && { pl: 3 }),
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Tooltip title={title} placement="right">
          <span style={{ display: "flex" }}>{icon}</span>
        </Tooltip>
      </ListItemIcon>
      <ListItemText
        primary={title}
        sx={{
          visibility: sidebarExpanded ? "visible" : "hidden",
          whiteSpace: "nowrap",
        }}
      />
    </ListItemButton>
  );
};

// ---- SectionHeader ----

interface SectionHeaderProps {
  title: string;
  sidebarExpanded: boolean;
}

const SectionHeader: FunctionComponent<SectionHeaderProps> = ({
  title,
  sidebarExpanded,
}) => {
  if (!sidebarExpanded) {
    return null;
  }
  return (
    <ListSubheader
      component="div"
      sx={{
        textTransform: "uppercase",
        ml: 1,
        lineHeight: "28px",
        fontSize: "0.7rem",
        mt: 0.5,
      }}
    >
      {sidebarExpanded ? title : "\u00A0"}
    </ListSubheader>
  );
};

// ---- TsuruSidebar ----

const TsuruSidebar: FunctionComponent<TsuruSidebarProps> = ({ expanded }) => {
  const transition = "width 325ms cubic-bezier(0.4, 0, 0.6, 1) 0ms";

  return (
    <Box component="nav">
      <Drawer
        variant="permanent"
        sx={{
          width: expanded ? drawerWidth : drawerClosedWidth,
          whiteSpace: "nowrap",
          overflow: "hidden",
          transition,
        }}
        slotProps={{
          paper: {
            sx: {
              overflow: "hidden",
              transition,
              width: expanded ? drawerWidth : drawerClosedWidth,
              paddingTop: "70px",
            },
          },
        }}
      >
        <Box sx={{ overflowX: "hidden", overflowY: "auto", height: "100%" }}>
          <List component="nav">
            <NavLink
              title="Apps"
              path="/apps"
              icon={<AppsIcon />}
              sidebarExpanded={expanded}
              alsoMatch="/"
            />

            {config.services ? (
              <>
                <SectionHeader title="Services" sidebarExpanded={expanded} />

                {config.services.map((service) => (
                  <NavLink
                    key={service.name}
                    title={service.title}
                    path={`/services/${service.name}`}
                    icon={<ServiceIcon service={service.name} />}
                    sidebarExpanded={expanded}
                    indent
                  />
                ))}
                <NavLink
                  title="Others"
                  path="/services"
                  icon={<MiscellaneousServicesIcon />}
                  sidebarExpanded={expanded}
                  exact
                  indent
                />
              </>
            ) : (
              <NavLink
                title="Services"
                path="/services"
                icon={<MiscellaneousServicesIcon />}
                sidebarExpanded={expanded}
              />
            )}

            <NavLink
              title="Jobs"
              path="/jobs"
              icon={<ScheduleIcon />}
              sidebarExpanded={expanded}
            />
            <NavLink
              title="Volumes"
              path="/volumes"
              icon={<FolderIcon />}
              sidebarExpanded={expanded}
            />
            <NavLink
              title="Teams"
              path="/teams"
              icon={<PeopleIcon />}
              sidebarExpanded={expanded}
            />
            <NavLink
              title="Tokens"
              path="/tokens"
              icon={<PinIcon />}
              sidebarExpanded={expanded}
            />
            <NavLink
              title="Platforms"
              path="/platforms"
              icon={<IntegrationInstructionsIcon />}
              sidebarExpanded={expanded}
            />
            <NavLink
              title="Docs"
              path={config.docsURL || "https://docs.tsuru.io"}
              icon={<DocumentScanner />}
              sidebarExpanded={expanded}
              exact
              external
            />

            <SectionHeader title="Admin" sidebarExpanded={expanded} />

            <NavLink
              title="Clusters"
              path="/admin/clusters"
              icon={<LanIcon />}
              sidebarExpanded={expanded}
              indent
            />
            <NavLink
              title="Pools"
              path="/admin/pools"
              icon={<WorkspacesIcon />}
              sidebarExpanded={expanded}
              indent
            />
            <NavLink
              title="Deploys"
              path="/deploys"
              icon={<SystemUpdateAltIcon />}
              sidebarExpanded={expanded}
              indent
            />
            <NavLink
              title="Events"
              path="/events"
              icon={<EventIcon />}
              sidebarExpanded={expanded}
              indent
            />
            {/* TODO: implement these 4 pages some day
            <NavLink
              title="Services"
              path="/admin/services"
              icon={<DesignServicesIcon />}
              sidebarExpanded={expanded}
              indent
            />
             <NavLink
              title="Users"
              path="/admin/users"
              icon={<PersonIcon />}
              sidebarExpanded={expanded}
              indent
            />
            <NavLink
              title="Roles"
              path="/admin/roles"
              icon={<WorkspacePremiumIcon />}
              sidebarExpanded={expanded}
              indent
            />
            <NavLink
              title="Routers"
              path="/admin/routers"
              icon={<HttpIcon />}
              sidebarExpanded={expanded}
              indent
            /> */}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default TsuruSidebar;
