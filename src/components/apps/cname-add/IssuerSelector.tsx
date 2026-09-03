import { FunctionComponent, useMemo } from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  alpha,
  useTheme,
  Chip,
  Stack,
} from "@mui/material";
import config from "../../../config";
import { IssuerOption } from "../../../types/config";

// Built on render rather than at import time, since the issuers come from the
// config loaded at boot.
const issuerOptionsFromConfig = (): IssuerOption[] => [
  {
    value: "none",
    label: "No certificate",
    description: "Add the CNAME only, without configuring a TLS certificate.",
    cost: "",
  },
  ...(config.certificateIssuers || []),
];

type IssuerSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const IssuerSelector: FunctionComponent<IssuerSelectorProps> = ({
  value,
  onChange,
}) => {
  const theme = useTheme();
  const issuerOptions = useMemo(issuerOptionsFromConfig, []);

  return (
    <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
      <Stack spacing={1.5}>
        {issuerOptions.map((option) => {
          const selected = value === option.value;
          return (
            <Box
              key={option.value}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `2px solid ${
                  selected
                    ? theme.palette.primary.main
                    : alpha(theme.palette.divider, 0.15)
                }`,
                bgcolor: selected
                  ? alpha(theme.palette.primary.main, 0.04)
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: selected
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.3),
                },
              }}
              onClick={() => onChange(option.value)}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <FormControlLabel
                  value={option.value}
                  control={<Radio size="small" />}
                  label=""
                  sx={{ m: 0, mr: -1 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body1" fontWeight={600}>
                      {option.label}
                    </Typography>
                    {option.recommended && (
                      <Chip
                        label="Recommended"
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                      />
                    )}
                    {option.cost && (
                      <Chip
                        label={option.cost}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem" }}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {option.description}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </RadioGroup>
  );
};

export default IssuerSelector;
