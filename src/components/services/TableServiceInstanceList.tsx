import { ReactNode } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ServiceInstance } from "../../types/serviceInstance";
import Link from "../base/MuiLink";
import { hrefForInstance } from "../../utils/services";

type TableServiceInstanceListProps = {
  rows: Array<ServiceInstance>;
  showServiceName?: boolean;
  showPool?: boolean;
  iconForInstance?: (serviceInstance: ServiceInstance) => ReactNode;
};

const TableServiceInstanceList = ({
  rows,
  showServiceName,
  showPool = false,
}: TableServiceInstanceListProps) => {
  const columns: GridColDef<ServiceInstance>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 0.5,
      renderCell(params) {
        const [href] = hrefForInstance(params.row.service_name, params.row.name);
        return <Link href={href}>{params.row.name}</Link>;
      },
    },
    ...(showServiceName
      ? [
          {
            field: "service_name",
            headerName: "Service",
            flex: 0.3,
          } as GridColDef<ServiceInstance>,
        ]
      : []),
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "plan_name",
      headerName: "Plan",
      flex: 0.3,
    },
    ...(showPool
      ? [
          {
            field: "pool",
            headerName: "Pool",
            flex: 0.4,
          } as GridColDef<ServiceInstance>,
        ]
      : []),
    {
      field: "team_owner",
      headerName: "Team",
      flex: 0.4,
    },
  ];

  return (
    <DataGrid
      rows={rows}
      getRowId={(row) => row.service_name + "/" + row.name}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 100,
          },
        },
        sorting: {
          sortModel: [{ field: "name", sort: "asc" }],
        },
      }}
      pageSizeOptions={[100]}
      disableRowSelectionOnClick
      sx={{ height: "85%" }}
    />
  );
};

export default TableServiceInstanceList;
