import { FunctionComponent } from "react";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import { ReactComponent as TsuruLogo } from "./logo.svg";
import Link from "./MuiLink";
import LoggedButton from "../auth/LoggedButton";
import { Button, Tooltip } from "@mui/material";
import config from "../../config";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useThemeMode } from "../../contexts/themeMode";

type TsuruToolbarProps = {
  onMenuClick?: CallableFunction;
};

const TsuruToolbar: FunctionComponent<TsuruToolbarProps> = (props) => {
  const { mode, toggleMode } = useThemeMode();

  return (
    <MuiAppBar position="absolute" sx={{ zIndex: 10000 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={(e) => (props.onMenuClick ? props.onMenuClick() : null)}
          sx={{
            marginRight: "6px",
          }}
        >
          <MenuIcon />
        </IconButton>
        <Link href="/">
          <TsuruLogo viewBox="0 0 240 40" width="100" />
        </Link>

        <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
          <IconButton
            color="inherit"
            onClick={toggleMode}
            sx={{ marginLeft: "auto", marginRight: 1 }}
          >
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>

        {config.feedbackLink && (
          <Button
            color="secondary"
            variant="contained"
            href={config.feedbackLink}
            sx={{
              ml: 2,
              textTransform: "none",
            }}
            target="_blank"
          >
            Feedback
          </Button>
        )}
        <LoggedButton />
      </Toolbar>
    </MuiAppBar>
  );
};

export default TsuruToolbar;
