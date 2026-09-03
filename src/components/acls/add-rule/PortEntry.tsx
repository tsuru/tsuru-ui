import { FunctionComponent } from "react";
import {
  Stack,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { ACLProtoPort } from "../../../types/acl";
import { PROTOCOLS } from "./types";

type PortEntryProps = {
  port: ACLProtoPort;
  onChange: (port: ACLProtoPort) => void;
  onRemove: () => void;
  showRemove: boolean;
};

const PortEntry: FunctionComponent<PortEntryProps> = ({
  port,
  onChange,
  onRemove,
  showRemove,
}) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        label="Port"
        type="number"
        size="small"
        value={port.Port || ""}
        onChange={(e) =>
          onChange({ ...port, Port: parseInt(e.target.value, 10) || 0 })
        }
        placeholder="e.g., 443"
        sx={{ width: 120 }}
        inputProps={{ min: 1, max: 65535 }}
      />
      <FormControl size="small">
        <RadioGroup
          row
          value={port.Protocol}
          onChange={(e) => onChange({ ...port, Protocol: e.target.value })}
        >
          {PROTOCOLS.map((proto) => (
            <FormControlLabel
              key={proto}
              value={proto}
              control={<Radio size="small" />}
              label={proto}
            />
          ))}
        </RadioGroup>
      </FormControl>
      {showRemove && (
        <Tooltip title="Remove port">
          <IconButton
            size="small"
            onClick={onRemove}
            sx={{
              color: theme.palette.error.main,
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};

export default PortEntry;
