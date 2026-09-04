import cronstrue from "cronstrue";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Job } from "../../types/jobs";
import Link from "../base/MuiLink";
import { Chip } from "@mui/material";

const TableJobList = ({ rows }: { rows: Array<Job> }) => {
  const columns: GridColDef<Job>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 0.5,
      renderCell(params) {
        return <Link href={`/jobs/${params.row.name}`}>{params.row.name}</Link>;
      },
    },
    {
      field: "schedule",
      headerName: "Schedule",
      flex: 0.5,
      sortable: false,
      renderCell(params) {
        if (params.row.spec.manual) {
          return <Chip label="Manual" size="small" />;
        }
        if (!params.row.spec.schedule) {
          return null;
        }
        return cronstrue.toString(params.row.spec.schedule);
      },
    },
    {
      field: "teamOwner",
      headerName: "Team",
      flex: 0.4,
    },
    {
      field: "pool",
      headerName: "Pool",
      flex: 0.4,
    },
    {
      field: "plan",
      headerName: "Plan",
      flex: 0.3,
      valueFormatter: (value: Job["plan"]) => value?.name,
      sortComparator: (v1, v2) =>
        (v1?.name ?? "").localeCompare(v2?.name ?? ""),
    },
  ];

  return (
    <DataGrid
      rows={rows}
      getRowId={(row) => row.name}
      columns={columns}
      initialState={{
        pagination: { paginationModel: { pageSize: 100 } },
        sorting: { sortModel: [{ field: "name", sort: "asc" }] },
      }}
      pageSizeOptions={[100]}
      disableRowSelectionOnClick
      sx={{ height: "85%" }}
    />
  );
};

export default TableJobList;
