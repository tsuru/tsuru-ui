import {
  Breadcrumbs,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { FunctionComponent } from "react";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import { People, Person } from "@mui/icons-material";
import Subtitle from "../../components/base/Subtitle";
import DisplayError from "../../components/base/DisplayError";
import { useParams } from "react-router-dom";
import { useTeamGroups, useTeamUsers } from "../../hooks/auth";
import { useTitle } from "react-use";
import config from "../../config";

const TeamView: FunctionComponent = () => {
  const params = useParams();
  const users = useTeamUsers(params.id as string);
  const groups = useTeamGroups(params.id as string);

  useTitle(`Team: ${params.id}`);

  if (users.error) {
    return <DisplayError error={users.error} />;
  }

  if (groups.error) {
    return <DisplayError error={groups.error} />;
  }

  if (users.loading || !users.value || groups.loading || !groups.value) {
    return <Loading />;
  }

  let groupURL = (group: string): string | undefined => undefined;

  if (config.groupURL) {
    groupURL = config.groupURL;
  }

  const groupsElems = groups.value.map((group, i) => {
    const props: Record<string, string> = {};
    const href = groupURL(group.group);
    if (href) {
      props.href = href;
      props.target = "_blank";
    }

    return (
      <ListItemButton key={"group-" + group.group} {...props}>
        <ListItemIcon>
          <People />
        </ListItemIcon>
        <ListItemText
          primary={`group: ${group.group}`}
          secondary={group.roles.join(", ")}
        />
      </ListItemButton>
    );
  });

  const usersElems = users.value.map((user, i) => (
    <ListItem key={"user-" + user.email}>
      <ListItemIcon>
        <Person />
      </ListItemIcon>
      <ListItemText
        primary={`user: ${user.email}`}
        secondary={user.roles.join(", ")}
      />
    </ListItem>
  ));

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link underline="hover" color="inherit" href="/teams">
          Teams
        </Link>
        <Typography>{params.id}</Typography>
      </Breadcrumbs>

      <Subtitle>Members</Subtitle>
      <List>
        {groupsElems}
        {usersElems}
      </List>
    </>
  );
};

export default TeamView;
