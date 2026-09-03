import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Unit } from "../../types/provisioner";
import time from "../../utils/time";

type UnitListProps = {
  units: Array<Unit>;
};

function UnitList(props: UnitListProps) {
  const columns: GridColDef<Unit>[] = [
    { field: "Name", headerName: "Name", minWidth: 400, flex: 1 },
    {
      field: "IP",
      headerName: "Host",
      minWidth: 120,
    },
    {
      field: "Status",
      headerName: "Status",
    },
    {
      field: "Restarts",
      headerName: "Restarts",
    },
    {
      field: "createdAt",
      headerName: "Age",
      renderCell: (params) => {
        return time.humanSince(Date.now() - Date.parse(params.row.CreatedAt));
      },
    },
  ];

  return (
    <>
      <DataGrid
        rows={props.units}
        getRowId={(unit: Unit) => unit.Name}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
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
      />
    </>
  );
}

export default UnitList;
