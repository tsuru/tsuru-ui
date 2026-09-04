import { Component, ErrorInfo, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { Box, Button } from "@mui/material";

import DisplayError from "./DisplayError";

type ErrorBoundaryProps = {
  children: ReactNode;

  // Changing this clears a caught error. Pass the current location so that
  // navigating away from a broken view recovers, instead of stranding the user
  // on the error screen for the rest of the session.
  resetKey?: string;

  // Rendered below the error, to give the user something to do about it.
  action?: ReactNode;
};

type ErrorBoundaryState = {
  error?: Error;
};

// A render error anywhere under here would otherwise unmount the whole tree and
// leave the user on a blank page with nothing to report. React only surfaces
// those through a class component, so this stays a class.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: undefined });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled error while rendering:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <>
          <DisplayError error={this.state.error} />
          {this.props.action && <Box sx={{ mt: 2 }}>{this.props.action}</Box>}
        </>
      );
    }

    return this.props.children;
  }
}

// Wraps the routed part of the app: the error clears on navigation, and the
// error screen offers a way back for when the broken route is the one the user
// landed on.
const RouteErrorBoundary = (props: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <ErrorBoundary
      resetKey={location.pathname}
      action={
        <Button variant="outlined" component={Link} to="/">
          Back to safety
        </Button>
      }
    >
      {props.children}
    </ErrorBoundary>
  );
};

export { RouteErrorBoundary };

export default ErrorBoundary;
