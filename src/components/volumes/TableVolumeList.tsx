import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Volume } from "../../types/volumes";
import Link from "../base/MuiLink";

const TableVolumeList = ({ rows }: { rows: Array<Volume> }) => {
  const columns: GridColDef<Volume>[] = [
    {
      field: "Name",
      headerName: "Name",
      flex: 0.5,
      renderCell(params) {
        return (
          <Link href={`/volumes/${params.row.Name}`}>{params.row.Name}</Link>
        );
      },
    },
    {
      field: "Plan",
      headerName: "Plan",
      flex: 0.3,
      valueFormatter: (value: Volume["Plan"]) => value?.Name,
      sortComparator: (v1, v2) =>
        (v1?.Name ?? "").localeCompare(v2?.Name ?? ""),
    },
    {
      field: "Pool",
      headerName: "Pool",
      flex: 0.4,
    },
    {
      field: "TeamOwner",
      headerName: "Team",
      flex: 0.4,
    },
  ];

  return (
    <DataGrid
      rows={rows}
      getRowId={(row) => row.Name}
      columns={columns}
      initialState={{
        pagination: { paginationModel: { pageSize: 100 } },
        sorting: { sortModel: [{ field: "Name", sort: "asc" }] },
      }}
      pageSizeOptions={[100]}
      disableRowSelectionOnClick
      sx={{ height: "85%" }}
    />
  );
};

export default TableVolumeList;
