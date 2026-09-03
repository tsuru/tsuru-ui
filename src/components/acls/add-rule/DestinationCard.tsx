import { FunctionComponent } from "react";
import { Box, Paper, Typography, Stack, alpha, useTheme } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { DestinationOption } from "./types";

type DestinationCardProps = {
  option: DestinationOption;
  selected: boolean;
  onSelect: () => void;
};

const DestinationCard: FunctionComponent<DestinationCardProps> = ({
  option,
  selected,
  onSelect,
}) => {
  const theme = useTheme();
  const Icon = option.icon;

  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 2.5,
        cursor: "pointer",
        border: `2px solid ${
          selected
            ? theme.palette.primary.main
            : alpha(theme.palette.divider, 0.15)
        }`,
        borderRadius: 2,
        transition: "all 0.2s ease-in-out",
        position: "relative",
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.04)
          : "transparent",
        "&:hover": {
          borderColor: selected
            ? theme.palette.primary.main
            : alpha(theme.palette.primary.main, 0.4),
          transform: "translateY(-2px)",
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
    >
      {selected && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 20,
            height: 20,
            borderRadius: "50%",
            bgcolor: theme.palette.primary.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle
            sx={{ fontSize: 14, color: theme.palette.primary.contrastText }}
          />
        </Box>
      )}

      <Stack spacing={1.5} sx={{ mt: 0 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: selected
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.primary.main, 0.06),
            color: selected
              ? theme.palette.primary.main
              : alpha(theme.palette.text.primary, 0.6),
            transition: "all 0.2s ease-in-out",
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>

        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {option.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.primary.main, 0.7),
              fontWeight: 500,
            }}
          >
            {option.subtitle}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.5 }}
        >
          {option.description}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default DestinationCard;
