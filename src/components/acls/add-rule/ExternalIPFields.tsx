import { FunctionComponent } from "react";
import { TextField, InputAdornment, alpha, useTheme } from "@mui/material";
import { Public } from "@mui/icons-material";
import { ACLProtoPort } from "../../../types/acl";
import { validateCIDR } from "./types";
import PortsField from "./PortsField";

type ExternalIPFieldsProps = {
  ip: string;
  onIPChange: (value: string) => void;
  ports: ACLProtoPort[];
  onAddPort: () => void;
  onUpdatePort: (index: number, port: ACLProtoPort) => void;
  onRemovePort: (index: number) => void;
};

const ExternalIPFields: FunctionComponent<ExternalIPFieldsProps> = ({
  ip,
  onIPChange,
  ports,
  onAddPort,
  onUpdatePort,
  onRemovePort,
}) => {
  const theme = useTheme();
  const ipError = ip.length > 0 && !validateCIDR(ip);

  return (
    <>
      <TextField
        label="IP Address / CIDR"
        value={ip}
        onChange={(e) => onIPChange(e.target.value)}
        placeholder="e.g., 10.0.0.1 or 10.0.0.0/24"
        fullWidth
        required
        error={ipError}
        helperText={
          ipError
            ? "Invalid IP address or CIDR notation (e.g., 192.168.1.0/24)"
            : "Single IP address or CIDR range to allow access to"
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Public
                sx={{
                  color: alpha(theme.palette.text.primary, 0.4),
                }}
              />
            </InputAdornment>
          ),
        }}
      />
      <PortsField
        ports={ports}
        onAdd={onAddPort}
        onUpdate={onUpdatePort}
        onRemove={onRemovePort}
      />
    </>
  );
};

export default ExternalIPFields;
