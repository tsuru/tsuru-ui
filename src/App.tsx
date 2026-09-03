import { useMemo, useState } from "react";

import { ThemeProvider } from "@mui/material/styles";

import Box from "@mui/material/Box";

import TsuruToolbar from "./components/base/TsuruToolbar";
import TsuruRouter from "./views/router";
import TsuruSidebar from "./components/base/TsuruSidebar";
import { BrowserRouter } from "react-router-dom";
import config from "./config";
import { AuthContextProvider } from "./contexts/auth";
import { CssBaseline, styled } from "@mui/material";
import { createMaterialTheme } from "./style";
import { ThemeModeProvider, useThemeMode } from "./contexts/themeMode";

const sideBarOpenOnBoot = window.localStorage.tsuruSideBarOpen !== "false";

function App() {
  return (
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  );
}

function ThemedApp() {
  const { mode } = useThemeMode();
  const theme = useMemo(() => createMaterialTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <AuthContextProvider>
        <BrowserRouter basename={config.prefix}>
          <AppContent />
        </BrowserRouter>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

const MainBox = styled("main", {
  shouldForwardProp: (prop) => prop !== "expanded",
})<{
  expanded?: boolean;
}>(({ expanded }) => ({
  flexGrow: 1,
  paddingTop: "70px",
  paddingLeft: "10px",
  paddingRight: "10px",
  overflow: "auto",
  height: "100vh",
  transition: "margin-left 325ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
  marginLeft: "10px",
}));

const AppContent = () => {
  const [sideBarOpen, setSideBarOpenState] = useState(sideBarOpenOnBoot);

  const setSideBarOpen = (b: boolean) => {
    window.localStorage.tsuruSideBarOpen = b;
    setSideBarOpenState(b);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />
      <TsuruToolbar
        onMenuClick={() => {
          setSideBarOpen(!sideBarOpen);
        }}
      />
      <TsuruSidebar expanded={sideBarOpen} />
      <MainBox expanded={sideBarOpen}>
        <TsuruRouter />
      </MainBox>
    </Box>
  );
};

export default App;
