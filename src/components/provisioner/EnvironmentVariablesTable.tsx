import { FunctionComponent, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, Tooltip } from "@mui/material";
import { EnvironmentVar } from "../../types/provisioner";
import Link from "../base/JoyLink";

type CopyToClipboardProps = {
  copied: boolean;
  error?: string;
  onClick: CallableFunction;
};
const CopyToClipboard = (props: CopyToClipboardProps) => {
  let title = props.copied ? "Copied to clipboard!" : "Copy to clipboard";
  if (props.error) {
    title = `Error: ${props.error}`;
  }
  return (
    <Tooltip title={title}>
      <Button
        size="small"
        variant="text"
        onClick={() => {
          props.onClick();
        }}
      >
        ******
      </Button>
    </Tooltip>
  );
};

type EnvironmentVariablesTableProps = {
  envs: Array<EnvironmentVar>;
};

const EnvironmentVariablesTable: FunctionComponent<
  EnvironmentVariablesTableProps
> = ({ envs }) => {
  const [copiedEnv, setCopiedEnv] = useState<string>("");
  const [err, setErr] = useState<unknown>(null);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Managed by</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {envs.length === 0 && (
            <TableRow
              hover
              key={0}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                no envs
              </TableCell>
            </TableRow>
          )}
          {envs.map((env) => (
            <TableRow
              hover
              key={0}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {env.name}
              </TableCell>
              {env.public && (
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    wordBreak: "break-all",
                  }}
                >
                  {env.value}
                </TableCell>
              )}
              {!env.public && (
                <TableCell component="th" scope="row">
                  <CopyToClipboard
                    copied={env.name === copiedEnv}
                    error={err ? `${err}` : undefined}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(env.value);
                        setCopiedEnv(env.name);
                      } catch (e) {
                        setErr(e);
                      }
                    }}
                  />
                </TableCell>
              )}

              <TableCell component="th" scope="row">
                <ManagedByLink managedBy={env.managedBy} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ManagedByLink = ({ managedBy }: { managedBy: string | undefined }) => {
  if (!managedBy) {
    return null;
  }
  if (managedBy.includes("/")) {
    return <Link href={`/services/${managedBy}`}>{managedBy}</Link>;
  }
  return <>{managedBy}</>;
};

export default EnvironmentVariablesTable;
