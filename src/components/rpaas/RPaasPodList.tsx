import React, { useState } from "react";

import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";

import resources from "../../utils/resources";
import time from "../../utils/time";
import { History, Pageview, PestControl, Terminal } from "@mui/icons-material";
import { RPaasPod } from "../../types/rpaas";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { Snackbar } from "@mui/material";

type RPaasPodListProps = {
  pool: string;
  service: string;
  instance: string;
  pods: Array<RPaasPod>;
};

function RPaasPodList(props: RPaasPodListProps) {
  const navigate = useNavigate();
  const [snackBarTitle, setSnackBarTitle] = useState<string | null>(null);

  const unitStatus = (pod: RPaasPod): string => {
    if (pod.ready) {
      return "ready";
    }

    return pod.status;
  };

  const cloudProviderLogLink = (pod: RPaasPod): string => {
    if (config.cloudProviderLogsForRPaaS) {
      return config.cloudProviderLogsForRPaaS(
        props.pool,
        props.service,
        props.instance,
        pod.name
      );
    }
    return "";
  };

  const rows: Array<Record<string, any>> = props.pods.map((pod) => {
    return {
      id: pod.name,
      host: pod.host,
      status: unitStatus(pod),
      restarts: pod.restarts,
      createdAt: Date.parse(pod.createdAt),
      cpu: resources.quantityToScalar(pod.metrics?.cpu),
      memory: resources.quantityToScalar(pod.metrics?.memory),
      cloudProviderLogLink: cloudProviderLogLink(pod),
    };
  });

  const copyCommandToClipBoard = (title: string, command: string) => {
    navigator.clipboard.writeText(command);
    setSnackBarTitle(title);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "Name", minWidth: 400, flex: 1 },
    {
      field: "host",
      headerName: "Host",
      minWidth: 120,
    },
    {
      field: "status",
      headerName: "Status",
    },
    {
      field: "restarts",
      headerName: "Restarts",
    },
    {
      field: "createdAt",
      headerName: "Age",
      renderCell: (params) => {
        return time.humanSince(Date.now() - params.row.createdAt);
      },
    },
    {
      field: "cpu",
      headerName: "CPU",
      renderCell: (params) => {
        return resources.scalarCPUToHuman(params.row.cpu);
      },
    },
    {
      field: "memory",
      headerName: "Memory",
      sortComparator: (a, b) => {
        return a < b ? -1 : a > b ? 1 : 0;
      },
      renderCell: (params) => {
        return resources.scalarMemoryToHuman(params.row.memory);
      },
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Terminal />}
          onClick={() => {
            copyCommandToClipBoard(
              "Command to shell on pod copied to your clipboard, please paste on your terminal",
              `tsuru rpaasv2 shell -s ${props.service} -i ${props.instance} -p ${params.row.id}`
            );
          }}
          label="Shell"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<PestControl />}
          onClick={() => {
            copyCommandToClipBoard(
              "Command to debug on pod copied to your clipboard, please paste on your terminal",
              `tsuru rpaasv2 debug --interactive --tty -s ${props.service} -i ${props.instance} -p ${params.row.id}`
            );
          }}
          label="Debug"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Pageview />}
          onClick={() => {
            navigate(
              `/services/${props.service}/${props.instance}/logs?pod=${params.row.id}`,
              {
                replace: true,
              }
            );
          }}
          label="Logs"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<History />}
          disabled={!params.row.cloudProviderLogLink}
          onClick={() => {
            if (params.row.cloudProviderLogLink) {
              window.open(params.row.cloudProviderLogLink, "_blank");
            }
          }}
          label="Logs in cloud provider"
          showInMenu
        />,
      ],
    },
  ];

  return (
    <>
      <DataGrid
        rows={rows}
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

      <Snackbar
        open={snackBarTitle !== null}
        autoHideDuration={5000}
        onClose={() => {
          setSnackBarTitle(null);
        }}
        message={snackBarTitle}
      />
    </>
  );
}

export default RPaasPodList;
