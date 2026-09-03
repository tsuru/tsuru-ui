import { Fragment, useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import Loading from "../Loading";
import {
  Breadcrumbs,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Subtitle from "../../components/base/Subtitle";
import { PeopleOutline, WorkspacePremium } from "@mui/icons-material";
import { UserAssignable } from "../../types/auth";
import config from "../../config";
import { useTitle } from "react-use";

const UserInfoView = () => {
  const { userInfo } = useContext(AuthContext);

  useTitle("User");

  if (userInfo === null) {
    return <Loading />;
  }

  let groupURL = (group: string): string | undefined => undefined;

  if (config.groupURL) {
    groupURL = config.groupURL;
  }

  const groupElems = (userInfo.Groups || []).map((group, i) => {
    const props: Record<string, string> = {};
    const href = groupURL(group);
    if (href) {
      props.href = href;
      props.target = "_blank";
    }

    return (
      <ListItemButton key={i} {...props}>
        <ListItemIcon>
          <PeopleOutline />
        </ListItemIcon>
        <ListItemText primary={group} />
      </ListItemButton>
    );
  });

  const secondaryText = (assignable: UserAssignable) => {
    const text =
      assignable.ContextValue.length > 0
        ? `${assignable.ContextType}: "${assignable.ContextValue}"`
        : assignable.ContextType;

    if (assignable.Group) {
      return `${text} assigned by group "${assignable.Group}" `;
    }

    return text;
  };

  const rolesElems = userInfo.Roles.map((role, i) => (
    <ListItemButton key={i} href={`/roles/${role.Name}`}>
      <ListItemIcon>
        <WorkspacePremium />
      </ListItemIcon>
      <ListItemText primary={role.Name} secondary={secondaryText(role)} />
    </ListItemButton>
  ));

  const permissionsElems = userInfo.Permissions.map((permission, i) => (
    <ListItem key={i} disablePadding>
      <ListItemText
        sx={{ marginTop: "1px", marginBottom: "1px" }}
        primary={`${permission.Name} (${secondaryText(permission)})`}
      />
    </ListItem>
  ));

  return (
    <Fragment>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>User Profile</Typography>
      </Breadcrumbs>

      <Subtitle>Email</Subtitle>
      <span>{userInfo.Email}</span>

      {userInfo.Groups && (
        <Fragment>
          <Subtitle>Groups</Subtitle>
          <List dense>{groupElems}</List>
        </Fragment>
      )}

      <Subtitle>Roles</Subtitle>
      <List dense>{rolesElems}</List>

      <Subtitle>Permissions</Subtitle>
      <List dense>{permissionsElems}</List>
    </Fragment>
  );
};

export default UserInfoView;
