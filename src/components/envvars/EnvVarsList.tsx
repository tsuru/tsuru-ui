import { FunctionComponent, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Stack,
  Alert,
  alpha,
  useTheme,
  Fade,
  CircularProgress,
} from "@mui/material";
import { Settings, Info } from "@mui/icons-material";
import { EnvironmentVar } from "../../types/provisioner";
import EnvVarRow from "./EnvVarRow";
import EnvVarAddForm from "./EnvVarAddForm";
import EnvVarsToolbar, { FilterType } from "./EnvVarsToolbar";
import EnvVarsDeleteDialog from "./EnvVarsDeleteDialog";

type EnvVarsListProps = {
  envs: EnvironmentVar[];
  loading: boolean;
  onRefresh: () => void;
  onAdd: (
    name: string,
    value: string,
    isPrivate: boolean,
    norestart: boolean
  ) => Promise<void>;
  onEdit: (
    name: string,
    value: string,
    isPrivate: boolean,
    norestart: boolean
  ) => Promise<void>;
  onDelete: (name: string, norestart: boolean) => Promise<void>;
  actionLoading?: boolean;
};

const isEditable = (env: EnvironmentVar): boolean => {
  if (!env.managedBy || env.managedBy === "" || env.managedBy === "dashboard") {
    return true;
  }
  return false;
};

const EnvVarsList: FunctionComponent<EnvVarsListProps> = ({
  envs,
  loading,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  actionLoading = false,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingEnv, setEditingEnv] = useState<string | null>(null);
  const [deleteDialogEnv, setDeleteDialogEnv] = useState<string | null>(null);
  const [deleteNorestart, setDeleteNorestart] = useState(false);

  // Sort envs: editable first, then by name
  const sortedEnvs = useMemo(() => {
    return [...envs].sort((a, b) => {
      const aEditable = isEditable(a);
      const bEditable = isEditable(b);
      if (aEditable && !bEditable) return -1;
      if (!aEditable && bEditable) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [envs]);

  // Filter envs
  const filteredEnvs = useMemo(() => {
    return sortedEnvs.filter((env) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = env.name.toLowerCase().includes(query);
        const matchesValue =
          env.public && env.value.toLowerCase().includes(query);
        if (!matchesName && !matchesValue) return false;
      }

      // Type filter
      switch (filter) {
        case "public":
          return env.public;
        case "private":
          return !env.public;
        case "editable":
          return isEditable(env);
        case "managed":
          return !!env.managedBy && env.managedBy !== "dashboard";
        default:
          return true;
      }
    });
  }, [sortedEnvs, searchQuery, filter]);

  // Group envs by editability
  const { editableEnvs, managedEnvs } = useMemo(() => {
    const editable: EnvironmentVar[] = [];
    const managed: EnvironmentVar[] = [];

    filteredEnvs.forEach((env) => {
      if (isEditable(env)) {
        editable.push(env);
      } else {
        managed.push(env);
      }
    });

    return { editableEnvs: editable, managedEnvs: managed };
  }, [filteredEnvs]);

  const existingNames = useMemo(() => envs.map((e) => e.name), [envs]);

  const handleAdd = useCallback(
    async (
      name: string,
      value: string,
      isPrivate: boolean,
      norestart: boolean
    ) => {
      await onAdd(name, value, isPrivate, norestart);
    },
    [onAdd]
  );

  const handleEdit = useCallback(
    async (
      name: string,
      value: string,
      isPrivate: boolean,
      norestart: boolean
    ) => {
      await onEdit(name, value, isPrivate, norestart);
      setEditingEnv(null);
    },
    [onEdit]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialogEnv) return;
    await onDelete(deleteDialogEnv, deleteNorestart);
    setDeleteDialogEnv(null);
    setDeleteNorestart(false);
  }, [deleteDialogEnv, deleteNorestart, onDelete]);

  if (loading && envs.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <EnvVarsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        totalCount={envs.length}
        filteredCount={filteredEnvs.length}
        onRefresh={onRefresh}
        loading={loading}
      />

      {/* Add Form */}
      <Box sx={{ mb: 3 }}>
        <EnvVarAddForm
          existingNames={existingNames}
          onAdd={handleAdd}
          disabled={actionLoading}
        />
      </Box>

      {/* Empty state */}
      {envs.length === 0 && !loading && (
        <Fade in>
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 4,
              borderRadius: 2,
              border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
            }}
          >
            <Settings
              sx={{
                fontSize: 48,
                color: theme.palette.text.disabled,
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No environment variables
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Add your first environment variable using the form above.
            </Typography>
          </Box>
        </Fade>
      )}

      {/* No results after filter */}
      {envs.length > 0 && filteredEnvs.length === 0 && (
        <Fade in>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No environment variables match your search criteria.
          </Alert>
        </Fade>
      )}

      {/* Editable Variables Section */}
      {editableEnvs.length > 0 && (
        <Fade in>
          <Box sx={{ mb: 4 }}>
            <Stack spacing={1.5}>
              {editableEnvs.map((env) => (
                <EnvVarRow
                  key={env.name}
                  env={env}
                  isEditable={true}
                  isEditing={editingEnv === env.name}
                  onEdit={() => setEditingEnv(env.name)}
                  onCancelEdit={() => setEditingEnv(null)}
                  onSave={handleEdit}
                  onDelete={() => setDeleteDialogEnv(env.name)}
                />
              ))}
            </Stack>
          </Box>
        </Fade>
      )}

      {/* Managed Variables Section */}
      {managedEnvs.length > 0 && (
        <Fade in>
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                mt: editableEnvs.length > 0 ? 2 : 0,
              }}
            >
              <Info sx={{ fontSize: 18, color: theme.palette.info.main }} />
              <Typography
                variant="subtitle2"
                sx={{ color: theme.palette.text.secondary }}
              >
                Managed Variables
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.disabled,
                  fontStyle: "italic",
                }}
              >
                (read-only, managed by tsuru or external services)
              </Typography>
            </Box>
            <Stack spacing={1.5}>
              {managedEnvs.map((env) => (
                <EnvVarRow
                  key={env.name}
                  env={env}
                  isEditable={false}
                  isEditing={false}
                />
              ))}
            </Stack>
          </Box>
        </Fade>
      )}

      {/* Delete Confirmation Dialog */}
      <EnvVarsDeleteDialog
        open={!!deleteDialogEnv}
        variableName={deleteDialogEnv || ""}
        norestart={deleteNorestart}
        onNorestartChange={setDeleteNorestart}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogEnv(null);
          setDeleteNorestart(false);
        }}
        loading={actionLoading}
      />
    </Box>
  );
};

export default EnvVarsList;
