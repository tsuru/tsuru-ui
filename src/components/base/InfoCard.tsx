import { FunctionComponent, ReactNode, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Collapse,
  alpha,
  useTheme,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

type InfoCardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  action?: ReactNode;
};

const InfoCard: FunctionComponent<InfoCardProps> = ({
  title,
  icon,
  children,
  collapsible = false,
  defaultExpanded = true,
  action,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: alpha(theme.palette.primary.main, 0.2),
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={expanded ? 2 : 0}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              {icon}
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            {action}
            {collapsible && (
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Stack>
        </Stack>

        <Collapse in={expanded}>
          <Box>{children}</Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};
export default InfoCard;
