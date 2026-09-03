import { FunctionComponent } from "react";
import { Box, Stack, Button, FormLabel, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { ACLProtoPort } from "../../../types/acl";
import PortEntry from "./PortEntry";

type PortsFieldProps = {
  ports: ACLProtoPort[];
  onAdd: () => void;
  onUpdate: (index: number, port: ACLProtoPort) => void;
  onRemove: (index: number) => void;
};

const PortsField: FunctionComponent<PortsFieldProps> = ({
  ports,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <Box>
      <FormLabel sx={{ mb: 1.5, display: "block", fontWeight: 500 }}>
        Allowed Ports (Optional)
      </FormLabel>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 2 }}
      >
        Leave empty to allow all ports, or specify specific ports to restrict
        access
      </Typography>
      <Stack spacing={2}>
        {ports.map((port, index) => (
          <PortEntry
            key={index}
            port={port}
            onChange={(p) => onUpdate(index, p)}
            onRemove={() => onRemove(index)}
            showRemove={ports.length > 0}
          />
        ))}
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={onAdd}
          sx={{ alignSelf: "flex-start" }}
        >
          Add Port
        </Button>
      </Stack>
    </Box>
  );
};

export default PortsField;
