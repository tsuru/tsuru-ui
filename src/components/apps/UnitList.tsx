import { useState, useCallback } from "react";

import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";

import { App, Unit, UnitMetric } from "../../types/app";

import resources from "../../utils/resources";
import time from "../../utils/time";
import {
  Delete,
  History,
  Pageview,
  Remove,
  Terminal,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { Snackbar } from "@mui/material";
import { useKillUnit } from "../../hooks/app";
import UnitKillDialog from "./UnitKillDialog";

type UnitListProps = {
  app?: App;
  units: Array<Unit>;
  unitsMetrics?: Array<UnitMetric>;
  sx?: Record<string, any>;
  onRefresh?: () => void;
};

type KillDialogState = {
  open: boolean;
  unitName: string;
  appName: string;
  force: boolean;
};

const initialKillDialogState: KillDialogState = {
  open: false,
  unitName: "",
  appName: "",
  force: false,
};

function UnitList(props: UnitListProps) {
  const navigate = useNavigate();
  const [snackBarTitle, setSnackBarTitle] = useState<string | null>(null);
  const [killDialog, setKillDialog] = useState<KillDialogState>(
    initialKillDialogState
  );

  const killUnitHook = useKillUnit(props.app?.name ?? "");

  const unitMetricMap: Map<string, UnitMetric> = new Map();

  for (let unitMetric of props.unitsMetrics || []) {
    unitMetricMap.set(unitMetric.ID, unitMetric);
  }

  const unitStatus = (unit: Unit): string => {
    if (unit.Ready) {
      return "ready";
    }

    if (unit.StatusReason) {
      return `${unit.Status} (${unit.StatusReason})`;
    }

    return unit.Status;
  };

  const cloudProviderLogsLink = (
    app: App | undefined | null,
    unit: string
  ): string => {
    return config.cloudProviderLogsForAppUnit && app
      ? config.cloudProviderLogsForAppUnit(app, unit)
      : "";
  };

  const rows: Array<Record<string, any>> = props.units.map((unit) => {
    return {
      id: unit.Name,
      app: unit.AppName,
      process: unit.ProcessName,
      host: unit.IP,
      internalIP: unit.InternalIP,
      status: unitStatus(unit),
      restarts: unit.Restarts,
      createdAt: Date.parse(unit.CreatedAt),
      cpu: resources.quantityToScalar(
        unitMetricMap.get(unit.Name)?.CPU as string
      ),
      memory: resources.quantityToScalar(
        unitMetricMap.get(unit.Name)?.Memory as string
      ),
      cloudProviderLogsLink: cloudProviderLogsLink(props.app, unit.Name),
    };
  });

  const copyCommandToClipBoard = async (title: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setSnackBarTitle(title);
    } catch (e) {
      setSnackBarTitle(`Could not write on clipboard: ${e}`);
    }
  };

  const handleKillUnit = useCallback(
    (appName: string, unitName: string, force: boolean) => {
      setKillDialog({
        open: true,
        unitName,
        appName,
        force,
      });
    },
    []
  );

  const handleKillConfirm = useCallback(async (): Promise<boolean> => {
    return killUnitHook.killUnit(killDialog.unitName, killDialog.force);
  }, [killUnitHook.killUnit, killDialog.unitName, killDialog.force]);

  const handleKillDialogClose = useCallback(() => {
    setKillDialog(initialKillDialogState);
    killUnitHook.reset();
  }, [killUnitHook.reset]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "Name", minWidth: 400, flex: 1 },
    {
      field: "process",
      headerName: "Process",
      flex: 0.5,
    },
    {
      field: "host",
      headerName: "Host",
      minWidth: 120,
    },
    {
      field: "internalIP",
      headerName: "Internal IP",
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
  ];

  if (!props.app) {
    columns.unshift({
      field: "app",
      headerName: "App",
      flex: 0.5,
    });
  }

  if (props.unitsMetrics) {
    columns.push({
      field: "cpu",
      headerName: "CPU",
      renderCell: (params) => {
        return resources.scalarCPUToHuman(params.row.cpu);
      },
    });
    columns.push({
      field: "memory",
      headerName: "Memory",
      sortComparator: (a, b) => {
        return a < b ? -1 : a > b ? 1 : 0;
      },
      renderCell: (params) => {
        return resources.scalarMemoryToHuman(params.row.memory);
      },
    });
  }

  columns.push({
    field: "actions",
    type: "actions",
    getActions: (params) => {
      const actions = [
        <GridActionsCellItem
          icon={<Remove />}
          onClick={() => {
            handleKillUnit(params.row.app, params.row.id, false);
          }}
          label="Kill"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Delete />}
          onClick={() => {
            handleKillUnit(params.row.app, params.row.id, true);
          }}
          label="Force kill"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Terminal />}
          onClick={() => {
            copyCommandToClipBoard(
              "Command to shell on unit copied to your clipboard, please paste on your terminal",
              `tsuru app shell -a ${params.row.app} ${params.row.id}`
            );
          }}
          label="Shell"
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Pageview />}
          onClick={() => {
            navigate(`/apps/${params.row.app}/log?unit=${params.row.id}`, {
              replace: true,
            });
          }}
          label="Logs"
          showInMenu
        />,
      ];

      if (params.row.cloudProviderLogsLink) {
        actions.push(
          <GridActionsCellItem
            icon={<History />}
            disabled={!params.row.cloudProviderLogsLink}
            onClick={() => {
              if (params.row.cloudProviderLogsLink) {
                window.open(params.row.cloudProviderLogsLink, "_blank");
              }
            }}
            label="Logs in cloud provider"
            showInMenu
          />
        );
      }

      return actions;
    },
  });

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
        sx={props.sx}
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

      <UnitKillDialog
        open={killDialog.open}
        unitName={killDialog.unitName}
        appName={killDialog.appName}
        force={killDialog.force}
        onConfirm={handleKillConfirm}
        onCancel={handleKillDialogClose}
        onSuccess={props.onRefresh}
        error={killUnitHook.error}
      />
    </>
  );
}

export default UnitList;
