import { FunctionComponent } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Search, Lock, LockOpen, Refresh } from "@mui/icons-material";

export type FilterType = "all" | "public" | "private" | "editable" | "managed";

type EnvVarsToolbarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalCount: number;
  filteredCount: number;
  onRefresh: () => void;
  loading?: boolean;
};

const EnvVarsToolbar: FunctionComponent<EnvVarsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  totalCount,
  filteredCount,
  onRefresh,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        mb: 3,
      }}
    >
      {/* Search */}
      <TextField
        size="small"
        placeholder="Search variables..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          minWidth: 280,
          flex: 1,
          maxWidth: 400,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: theme.palette.text.secondary }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Filter Toggle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, newFilter) => newFilter && onFilterChange(newFilter)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
              textTransform: "none",
              fontSize: "0.8rem",
              "&.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
              },
            },
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="public">
            <LockOpen sx={{ fontSize: 16, mr: 0.5 }} />
            Public
          </ToggleButton>
          <ToggleButton value="private">
            <Lock sx={{ fontSize: 16, mr: 0.5 }} />
            Private
          </ToggleButton>
          <ToggleButton value="editable">Editable</ToggleButton>
          <ToggleButton value="managed">Managed</ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title="Refresh">
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={loading}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Refresh
              fontSize="small"
              sx={{
                animation: loading ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
          </IconButton>
        </Tooltip>

        {/* Count indicator */}
        <Chip
          size="small"
          label={
            filteredCount === totalCount
              ? `${totalCount} variables`
              : `${filteredCount} of ${totalCount}`
          }
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 500,
          }}
        />
      </Box>
    </Box>
  );
};

export default EnvVarsToolbar;
