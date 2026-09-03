import { Alert } from "@mui/material";
import { FunctionComponent } from "react";
import Console from "./Console";

type DisplayErrorProps = {
  error: Error;
};

const DisplayError: FunctionComponent<DisplayErrorProps> = (props) => {
  return (
    <>
      <Alert severity="error">{`Something went wrong: ${props.error.message}`}</Alert>
      {props.error.cause && (
        <Console>{"Cause: " + JSON.stringify(props.error.cause)}</Console>
      )}
      {props.error.stack && (
        <Console>{`Stack trace: ${props.error.stack}`}</Console>
      )}
    </>
  );
};

export default DisplayError;
