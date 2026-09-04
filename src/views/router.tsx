import { FunctionComponent } from "react";

import AppsDashboard from "./apps/AppsDashboard";
import AppView from "./apps/AppView";

import { Route, Routes } from "react-router-dom";
import AppDeployInfo from "./apps/AppDeployInfo";
import EventListView from "./events/EventListView";
import EventInfoView from "./events/EventInfoView";
import DeployListView from "./events/DeployListView";
import JobsDashboard from "./jobs/JobsDashboard";
import ServiceInstancesDashboard from "./services/ServiceInstancesDashboard";
import DatabaseIcon from "../components/services/DatabaseIcon";
import RPaaSView from "./rpaas/RPaaSView";
import ACLView from "./acl/ACLView";
import ACLAddRuleView from "./acl/ACLAddRuleView";
import VolumesDashboard from "./volumes/VolumesDashboard";
import VolumeView from "./volumes/VolumeView";
import GenericServiceInstanceView from "./services/GenericServiceInstanceView";
import config from "../config";
import TokenView from "./auth/TokenView";
import TokenListView from "./auth/TokenListView";
import ClusterListView from "./provisioner/ClusterListView";
import ClusterView from "./provisioner/ClusterView";
import PoolListView from "./provisioner/PoolListView";
import PoolView from "./provisioner/PoolView";
import PlatformListView from "./provisioner/PlatformListView";
import UserInfoView from "./auth/UserInfoView";
import AppCreateWizard from "./apps/AppCreateWizard";
import AppUnitList from "./apps/AppsUnitList";
import TeamsListView from "./auth/TeamsListView";
import TeamView from "./auth/TeamView";
import JobView from "./jobs/JobView";
import AppStartView from "./apps/AppStartView";
import AppStopView from "./apps/AppStopView";
import AppRestartView from "./apps/AppRestartView";
import AppScaleView from "./apps/AppScaleView";
import AppEnvVarsView from "./apps/AppEnvVarsView";
import AppCNameAddView from "./apps/AppCNameAddView";
import AppServiceBindAddView from "./apps/AppServiceBindAddView";
import AppVolumeBindAddView from "./apps/AppVolumeBindAddView";
import EventCancelView from "./events/EventCancelView";

type TsuruRouterProps = {};

const TsuruRouter: FunctionComponent<TsuruRouterProps> = () => {
  const serviceRoutes = [];
  const nonGenericServices = [];

  for (const service of config.services || []) {
    nonGenericServices.push(service.name);

    for (const additionalService of service.additionalServices || []) {
      nonGenericServices.push(additionalService);
    }

    if (service.engine === "rpaas") {
      serviceRoutes.push(
        <Route
          path={`/services/${service.name}`}
          key={`dashboard-${service.name}`}
          element={
            <ServiceInstancesDashboard
              key={`dashboard-view-${service.name}`}
              services={[service.name, ...(service.additionalServices || [])]}
              showPool
              label={service.title}
            />
          }
        />
      );

      serviceRoutes.push(
        <Route
          key={`view-${service.name}`}
          path={`/services/${service.name}/:instanceName`}
          element={<RPaaSView service={service.name} title={service.title} />}
        />
      );

      serviceRoutes.push(
        <Route
          key={`view-tab-${service.name}`}
          path={`/services/${service.name}/:instanceName/:tab`}
          element={<RPaaSView service={service.name} title={service.title} />}
        />
      );
    }

    if (service.engine === "acl") {
      serviceRoutes.push(
        <Route
          path={`/services/${service.name}`}
          key={`dashboard-${service.name}`}
          element={
            <ServiceInstancesDashboard
              key={`dashboard-view-${service.name}`}
              services={[service.name, ...(service.additionalServices || [])]}
              label={service.title}
              iconForInstance={(instance) => {
                return (
                  <DatabaseIcon database={instance.plan_name.split("-")[0]} />
                );
              }}
            />
          }
        />
      );

      serviceRoutes.push(
        <Route
          path={`/services/${service.name}/:instanceName`}
          key={`view-${service.name}`}
          element={<ACLView service={service.name} />}
        />
      );

      serviceRoutes.push(
        <Route
          path={`/services/${service.name}/:instanceName/add`}
          key={`add-rule-${service.name}`}
          element={<ACLAddRuleView service={service.name} />}
        />
      );

      serviceRoutes.push(
        <Route
          path={`/services/${service.name}/:instanceName/:tab`}
          key={`view-tab-${service.name}`}
          element={<ACLView service={service.name} />}
        />
      );
    }
  }

  return (
    <Routes>
      <Route path="/" element={<AppsDashboard />} />
      <Route path="/apps" element={<AppsDashboard />} />
      <Route path="/apps/units" element={<AppUnitList />} />
      <Route path="/apps/_create" element={<AppCreateWizard />} />
      <Route path="/apps/:name" element={<AppView />} />
      <Route path="/apps/:name/start" element={<AppStartView />} />
      <Route path="/apps/:name/stop" element={<AppStopView />} />
      <Route path="/apps/:name/restart" element={<AppRestartView />} />
      <Route path="/apps/:name/scale/:process" element={<AppScaleView />} />
      <Route path="/apps/:name/envs" element={<AppEnvVarsView />} />
      <Route path="/apps/:name/cnames/add" element={<AppCNameAddView />} />
      <Route
        path="/apps/:name/services/add"
        element={<AppServiceBindAddView />}
      />
      <Route
        path="/apps/:name/volumes/add"
        element={<AppVolumeBindAddView />}
      />
      {/* Keep this catch-all tab route last among /apps/:name/* routes */}
      <Route path="/apps/:name/:tab" element={<AppView />} />
      <Route path="/apps/:app/deploys/:deployID" element={<AppDeployInfo />} />
      <Route path="/apps/:app/events/:eventID" element={<EventInfoView />} />
      <Route path="/events" element={<EventListView />} />
      <Route path="/events/:eventID/cancel" element={<EventCancelView />} />
      <Route path="/events/:eventID" element={<EventInfoView />} />
      <Route path="/deploys" element={<DeployListView />} />
      <Route path="/jobs" element={<JobsDashboard />} />
      <Route path="/jobs/:id" element={<JobView />} />
      <Route path="/jobs/:id/:tab" element={<JobView />} />
      <Route path="/volumes" element={<VolumesDashboard />} />
      <Route path="/volumes/:volumeID" element={<VolumeView />} />
      {serviceRoutes}

      <Route
        path="/services"
        element={
          <ServiceInstancesDashboard
            excludeServices={nonGenericServices}
            label="Services"
            showServiceName
          />
        }
      />

      <Route
        path="/services/:service/:instanceName"
        element={<GenericServiceInstanceView />}
      />

      <Route
        path="/services/:service/:instanceName/:tab"
        element={<GenericServiceInstanceView />}
      />

      <Route path="/user" element={<UserInfoView />} />
      <Route path="/tokens" element={<TokenListView />} />
      <Route path="/tokens/:id" element={<TokenView />} />

      <Route path="/teams" element={<TeamsListView />} />
      <Route path="/teams/:id" element={<TeamView />} />

      <Route path="/admin/clusters" element={<ClusterListView />} />
      <Route path="/admin/clusters/:id" element={<ClusterView />} />

      <Route path="/admin/pools" element={<PoolListView />} />
      <Route path="/admin/pools/:id" element={<PoolView />} />
      <Route path="/platforms" element={<PlatformListView />} />
    </Routes>
  );
};

export default TsuruRouter;
