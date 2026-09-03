import { FunctionComponent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Stack, Alert } from "@mui/material";
import { Add } from "@mui/icons-material";

import Loading from "../../views/Loading";
import DisplayError from "../base/DisplayError";
import ACLListRules from "./ACLListRules";
import { useACLRules, useDeleteACLRule } from "../../hooks/acl";

type ACLRulesPanelProps = {
  service: string;
  instanceName: string;
};

const ACLRulesPanel: FunctionComponent<ACLRulesPanelProps> = ({
  service,
  instanceName,
}) => {
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const aclRules = useACLRules(service, instanceName, reloadKey);
  const deleteACLRule = useDeleteACLRule();

  if (aclRules.error) {
    return <DisplayError error={aclRules.error} />;
  }

  if (aclRules.loading || !aclRules.value) {
    return <Loading />;
  }

  const handleDeleteRule = async (ruleID: string) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) {
      return;
    }

    try {
      setDeletingRuleId(ruleID);
      setDeleteError(null);
      await deleteACLRule(service, instanceName, ruleID);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete rule";
      setDeleteError(message);
    } finally {
      setDeletingRuleId(null);
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="flex-start" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`/services/${service}/${instanceName}/add`)}
          sx={{ borderRadius: 2 }}
        >
          Add Rule
        </Button>
      </Stack>

      {deleteError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setDeleteError(null)}
        >
          {deleteError}
        </Alert>
      )}

      <ACLListRules
        showCreator
        rules={aclRules.value.ServiceInstance.BaseRules}
        onDeleteRule={handleDeleteRule}
        isDeleting={deletingRuleId !== null}
      />
    </>
  );
};

export default ACLRulesPanel;
