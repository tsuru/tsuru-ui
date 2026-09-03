import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { ACLProtoPort, ACLRule, ACLRuleType } from "../../types/acl";
import { Chip, Stack, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

type ACLListRulesProps = {
  rules: Array<ACLRule>;
  showSource?: boolean;
  showCreator?: boolean;
  onDeleteRule?: (ruleID: string) => void;
  isDeleting?: boolean;
};
const ACLListRules = (props: ACLListRulesProps) => {
  const columns: GridColDef<ACLRule>[] = [
    {
      field: "Destination",
      headerName: "Destination",
      flex: 1,
      sortComparator,
      renderCell: (params) => {
        return (
          <ACLTypeText
            ruleType={params.row.Destination}
            removed={params.row.Removed}
          />
        );
      },
    },
    {
      field: "Created",
      width: 200,
    },
  ];

  if (props.showCreator) {
    columns.splice(1, 0, {
      field: "Creator",
      width: 200,
    });
  }

  if (props.showSource) {
    columns.splice(0, 0, {
      field: "Source",
      headerName: "Source",
      flex: 1,
      sortComparator,
      renderCell: (params) => {
        return (
          <ACLTypeText
            ruleType={params.row.Source}
            removed={params.row.Removed}
          />
        );
      },
    });
  }

  if (props.onDeleteRule) {
    columns.push({
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => props.onDeleteRule?.(params.row.RuleID)}
          disabled={props.isDeleting || params.row.Removed}
          title={params.row.Removed ? "Rule already removed" : "Delete rule"}
        >
          <Delete fontSize="small" />
        </IconButton>
      ),
    });
  }

  return (
    <DataGrid
      rows={props.rules}
      getRowId={(row) => row.RuleID}
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
              field: "Destination",
              sort: "asc",
            },
          ],
        },
      }}
      pageSizeOptions={[100]}
      disableRowSelectionOnClick
      getCellClassName={(params) => {
        if (params.value?.Removed) {
          return "removed";
        }
        return "";
      }}
    />
  );
};

const portsToChips = (ports: Array<ACLProtoPort>) => (
  <Stack direction="row" flexWrap="wrap">
    {ports.map((p) => (
      <Chip
        key={`${p.Port}/${p.Protocol}`}
        label={`port: ${p.Port}/${p.Protocol}`}
        size="small"
        sx={{ ml: 1 }}
      />
    ))}
  </Stack>
);

const destinationKind = (destination: ACLRuleType): string => {
  if (destination.ExternalDNS) {
    return "externalDNS";
  }

  if (destination.ExternalIP) {
    return "externalIP";
  }

  if (destination.RpaasInstance) {
    return "rpaas";
  }

  if (destination.TsuruApp) {
    if (!destination.TsuruApp.AppName) {
      return "tsuruPool";
    }

    return "tsuruApp";
  }

  if (destination.TsuruJob) {
    return "tsuruJob";
  }

  return "unkown";
};

type ACLTypeTextProps = {
  ruleType: ACLRuleType;
  removed: boolean;
};

const renderGrayText = (children: string) => (
  <span style={{ color: "gray" }}>{children}</span>
);

const renderNormalText = (children: string) => <span>{children}</span>;

const ACLTypeText = (props: ACLTypeTextProps) => {
  const ruleType = props.ruleType;
  let renderText = renderNormalText;
  if (props.removed) {
    renderText = renderGrayText;
  }

  if (ruleType.ExternalDNS) {
    const text = renderText(`DNS: ${ruleType.ExternalDNS.Name}`);
    return (
      <>
        {text} {portsToChips(ruleType.ExternalDNS.Ports)}
      </>
    );
  }

  if (ruleType.ExternalIP) {
    const text = renderText(`IP: ${ruleType.ExternalIP.IP}`);
    return (
      <>
        {text} {portsToChips(ruleType.ExternalIP.Ports)}
      </>
    );
  }

  if (ruleType.RpaasInstance) {
    return renderText(
      `RPaaS: ${ruleType.RpaasInstance.ServiceName}/${ruleType.RpaasInstance.Instance}`
    );
  }

  if (ruleType.TsuruApp) {
    if (!ruleType.TsuruApp.AppName) {
      return renderText(`Tsuru Pool: ${ruleType.TsuruApp.PoolName}`);
    }

    return renderText(`Tsuru App: ${ruleType.TsuruApp.AppName}`);
  }
  if (ruleType.TsuruJob) {
    return renderText(`Tsuru Job: ${ruleType.TsuruJob.JobName}`);
  }
  return <pre>{JSON.stringify(ruleType)}</pre>;
};

const sortComparator = (v1: ACLRuleType, v2: ACLRuleType): number => {
  const v1Kind = destinationKind(v1);
  const v2Kind = destinationKind(v2);

  if (v1Kind < v2Kind) {
    return -1;
  }

  if (v1Kind > v2Kind) {
    return 1;
  }

  if (v1.ExternalDNS && v2.ExternalDNS) {
    if (v1.ExternalDNS?.Name < v2.ExternalDNS?.Name) {
      return -1;
    } else if (v1.ExternalDNS?.Name > v2.ExternalDNS?.Name) {
      return 1;
    }
  }

  if (v1.ExternalIP && v2.ExternalIP) {
    if (v1.ExternalIP?.IP < v2.ExternalIP?.IP) {
      return -1;
    } else if (v1.ExternalIP?.IP > v2.ExternalIP?.IP) {
      return 1;
    }
  }

  if (
    v1.TsuruApp &&
    v2.TsuruApp &&
    v1.TsuruApp.AppName &&
    v2.TsuruApp.AppName
  ) {
    if (v1.TsuruApp.AppName < v2.TsuruApp.AppName) {
      return -1;
    } else if (v1.TsuruApp.AppName > v2.TsuruApp.AppName) {
      return 1;
    }
  }

  if (
    v1.TsuruApp &&
    v2.TsuruApp &&
    v1.TsuruApp.PoolName &&
    v2.TsuruApp.PoolName
  ) {
    if (v1.TsuruApp.PoolName < v2.TsuruApp.PoolName) {
      return -1;
    } else if (v1.TsuruApp.PoolName > v2.TsuruApp.PoolName) {
      return 1;
    }
  }

  if (v1.TsuruJob && v2.TsuruJob) {
    if (v1.TsuruJob.JobName < v2.TsuruJob.JobName) {
      return -1;
    } else if (v1.TsuruJob.JobName > v2.TsuruJob.JobName) {
      return 1;
    }
  }
  return 0;
};

export default ACLListRules;
