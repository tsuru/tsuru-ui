import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AppResume } from "../../types/app";
import Link from "../base/MuiLink";
import { Chip } from "@mui/material";

const TableAppList = ({ rows }: { rows: Array<AppResume> }) => {
  const columns: GridColDef<AppResume>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 0.5,
      renderCell(params) {
        return <Link href={`/apps/${params.row.name}`}>{params.row.name}</Link>;
      },
    },

    {
      field: "teamowner",
      headerName: "Team",
      flex: 0.5,
    },
    {
      field: "platform",
      headerName: "Platform",
      minWidth: 100,
      flex: 0.1,
      renderCell(params) {
        if (!params.row.platform) {
          return null;
        }
        return <Chip label={params.row.platform} />;
      },
    },
    {
      field: "pool",
      headerName: "Pool",
      flex: 0.5,
    },

    {
      field: "units",
      headerName: "Units",
      flex: 0.1,
      valueFormatter: (value: any) => {
        return value?.total;
      },
      sortComparator: (v1, v2) => {
        return v1.total - v2.total;
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 0.1,
      sortable: false,
      renderCell(params) {
        const units = params.row.units;

        const fullHealthy = units.ready === units.total && units.total > 0;

        if (fullHealthy) {
          return <Chip label="Healthy" variant="outlined" color="success" />;
        } else if (units.total === 0) {
          return <Chip label="Stopped" variant="outlined" />;
        } else if (units.error > 0) {
          return (
            <Chip
              label={`${units.error} units with errors`}
              variant="outlined"
              color="error"
            />
          );
        } else if (units.started > 0) {
          return (
            <Chip
              label={`${units.started} units with missing healthcheck`}
              variant="outlined"
              color="warning"
            />
          );
        } else if (units.starting > 0) {
          return (
            <Chip
              label={`${units.starting} units starting`}
              variant="outlined"
              color="warning"
            />
          );
        } else if (units.created > 0) {
          return (
            <Chip
              label={`${units.created} units is waiting to start`}
              variant="outlined"
              color="warning"
            />
          );
        }
      },
    },
  ];
  return (
    <DataGrid
      rows={rows}
      getRowId={(row) => row.name}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 100,
          },
        },
        columns: {
          columnVisibilityModel: {
            expires_at: false,
            created_at: false,
            last_access: false,
            roles: false,
          },
        },
        sorting: {
          sortModel: [
            {
              field: "id",
              sort: "asc",
            },
          ],
        },
      }}
      pageSizeOptions={[100]}
      disableRowSelectionOnClick
      sx={{ height: "70%" }}
    />
  );
};

export default TableAppList;
