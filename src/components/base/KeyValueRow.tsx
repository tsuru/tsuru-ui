import { FunctionComponent, ReactNode } from "react";
import { Stack, Typography, IconButton, Tooltip } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

type KeyValueRowProps = {
  label: string;
  value: ReactNode;
  copyable?: string;
};

const KeyValueRow: FunctionComponent<KeyValueRowProps> = ({
  label,
  value,
  copyable,
}) => {
  const copyToClipboard = () => {
    if (copyable) navigator.clipboard.writeText(copyable);
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      py={0.75}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
        {copyable && (
          <Tooltip title="Copy">
            <IconButton
              size="small"
              onClick={copyToClipboard}
              sx={{ opacity: 0.5 }}
            >
              <ContentCopy sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};

export default KeyValueRow;
