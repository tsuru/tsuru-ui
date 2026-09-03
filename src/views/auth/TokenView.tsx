import {
  Breadcrumbs,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Typography,
} from "@mui/material";
import { FunctionComponent, useState } from "react";
import { humanDate } from "../../utils/time";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import { Security } from "@mui/icons-material";
import Subtitle from "../../components/base/Subtitle";
import DisplayError from "../../components/base/DisplayError";
import { useParams } from "react-router-dom";
import { useToken } from "../../hooks/auth";
import { useTitle } from "react-use";

const TokenView: FunctionComponent = () => {
  const params = useParams();
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarError, setSnackBarError] = useState<string | null>(null);
  const { value, error, loading } = useToken(params.id as string);
  useTitle(`Token: ${params.id}`);

  if (error) {
    return <DisplayError error={error} />;
  }

  if (loading || !value) {
    return <Loading />;
  }

  const rolesElems = (value.roles || []).map((role, i) => (
    <ListItem key={i}>
      <ListItemIcon>
        <Security />
      </ListItemIcon>
      <ListItemText primary={role.Name} secondary={role.ContextValue} />
    </ListItem>
  ));

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link underline="hover" color="inherit" href="/tokens">
          Tokens
        </Link>
        <Typography>{params.id}</Typography>
      </Breadcrumbs>

      {value.description && (
        <>
          <Subtitle>Description</Subtitle>
          <span>{value.description}</span>
        </>
      )}

      <Subtitle>Team</Subtitle>
      <span>{value.team}</span>

      <Subtitle>Secret</Subtitle>
      <Button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value.token);
            setSnackBarOpen(true);
          } catch (e) {
            setSnackBarOpen(true);
            setSnackBarError(`${e}`);
          }
        }}
      >
        Copy token secret to clipboard
      </Button>

      <Subtitle>Created at</Subtitle>
      <span>{humanDate(value.created_at)}</span>

      <Subtitle>Created by</Subtitle>
      <span>{value.creator_email}</span>

      <Subtitle>Expires at</Subtitle>
      <span>
        {value.expires_at === "" || value.expires_at === "0001-01-01T00:00:00Z"
          ? "never"
          : humanDate(value.expires_at)}
      </span>
      <Subtitle>Last access</Subtitle>
      <span>
        {value.last_access === "" ||
        value.last_access === "0001-01-01T00:00:00Z"
          ? "never"
          : humanDate(value.last_access)}
      </span>

      {(value.roles || []).length > 0 && (
        <>
          <Subtitle>Roles</Subtitle>
          <List>{rolesElems}</List>
        </>
      )}
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={3000}
        onClose={() => {
          setSnackBarOpen(false);
        }}
        message={snackBarError ? snackBarError : "Token copied to clipboard"}
      />
    </>
  );
};

export default TokenView;
