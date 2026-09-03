import { FunctionComponent } from "react";
import { TextField, InputAdornment, alpha, useTheme } from "@mui/material";
import { Dns } from "@mui/icons-material";
import { ACLProtoPort } from "../../../types/acl";
import PortsField from "./PortsField";

type ExternalDNSFieldsProps = {
  hostname: string;
  onHostnameChange: (value: string) => void;
  ports: ACLProtoPort[];
  onAddPort: () => void;
  onUpdatePort: (index: number, port: ACLProtoPort) => void;
  onRemovePort: (index: number) => void;
};

const ExternalDNSFields: FunctionComponent<ExternalDNSFieldsProps> = ({
  hostname,
  onHostnameChange,
  ports,
  onAddPort,
  onUpdatePort,
  onRemovePort,
}) => {
  const theme = useTheme();

  return (
    <>
      <TextField
        label="DNS Hostname"
        value={hostname}
        onChange={(e) => onHostnameChange(e.target.value)}
        placeholder="e.g., api.example.com"
        fullWidth
        required
        helperText="The external DNS hostname to allow access to"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Dns
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

export default ExternalDNSFields;
