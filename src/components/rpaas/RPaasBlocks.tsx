import { Fragment } from "react";

import { RPaasBlock, RPaasFile, RPaasRoute } from "../../types/rpaas";
import Console from "../base/Console";
import { Button, Typography } from "@mui/material";

type RPaasBlocksProps = {
  blocks?: Array<RPaasBlock>;
  routes?: Array<RPaasRoute>;
  extraFiles?: Array<RPaasFile>;
};

const RPaasBlocks = (props: RPaasBlocksProps) => {
  const blocksElems = props.blocks
    ?.filter((b) => !b.server_name)
    .map((block) => <RPaaSBlockView key={block.block_name} block={block} />);

  const routeElems = props.routes
    ?.filter((r) => !r.server_name)
    .map((route) => <RPaaSRouteView key={route.path} route={route} />);

  const extraFilesElems = props.extraFiles?.map((extraFile) => (
    <RPaaSExtraFileView key={extraFile.name} extraFile={extraFile} />
  ));

  const serversList = servers(props.blocks || [], props.routes || []);

  const serversElem = serversList.map((server) => {
    return (
      <Fragment>
        <Typography
          variant="h5"
          style={{ marginTop: "50px" }}
        >{`Server name: ${server.serverName}`}</Typography>
        {server.blocks.map((block) => (
          <RPaaSBlockView key={block.block_name} block={block} />
        ))}
        {server.routes.map((route) => (
          <RPaaSRouteView key={route.path} route={route} />
        ))}
      </Fragment>
    );
  });

  return (
    <>
      <Typography variant="h5">Default Server</Typography>
      {blocksElems}
      {routeElems}
      {extraFilesElems}
      {serversElem}
    </>
  );
};

function servers(blocks: Array<RPaasBlock>, routes: Array<RPaasRoute>) {
  const blockByServer: Record<string, Array<RPaasBlock>> = {};
  const routesByServer: Record<string, Array<RPaasRoute>> = {};

  for (const block of blocks || []) {
    if (!block.server_name) {
      continue;
    }
    if (!blockByServer[block.server_name]) {
      blockByServer[block.server_name] = [];
    }
    blockByServer[block.server_name].push(block);
  }

  for (const route of routes || []) {
    if (!route.server_name) {
      continue;
    }
    if (!routesByServer[route.server_name]) {
      routesByServer[route.server_name] = [];
    }
    routesByServer[route.server_name].push(route);
  }

  const serverNames = Array.from(
    new Set(Object.keys(blockByServer).concat(Object.keys(routesByServer)))
  );
  serverNames.sort();

  return serverNames.map((serverName) => {
    return {
      serverName,
      blocks: blockByServer[serverName] || [],
      routes: routesByServer[serverName] || [],
    };
  });
}

const luaBlocks = new Set(["lua-worker", "lua-server"]);

function RPaaSBlockView({ block }: { block: RPaasBlock }) {
  const highlight = luaBlocks.has(block.block_name) ? "lua" : "nginx";

  return (
    <Fragment key={block.block_name}>
      <Typography variant="h6">{`Block: ${block.block_name}`}</Typography>
      <Console whiteSpace="pre" highlight={highlight}>
        {block.content}
      </Console>
    </Fragment>
  );
}

function RPaaSRouteView({ route }: { route: RPaasRoute }) {
  return (
    <Fragment key={route.path}>
      <Typography variant="h6">{`Route: ${route.path}${
        route.https_only ? ", HTTPs only" : ""
      }`}</Typography>
      {route.content && (
        <Console whiteSpace="pre" highlight="nginx">
          {route.content}
        </Console>
      )}
      {route.destination && <span>destination {route.destination}</span>}
    </Fragment>
  );
}

function RPaaSExtraFileView({ extraFile }: { extraFile: RPaasFile }) {
  if (extraFile.name.endsWith(".lua")) {
    var code = atob(extraFile.content);
    return (
      <Fragment key={extraFile.name}>
        <Typography variant="h6">{`File: ${extraFile.name}`}</Typography>
        <Console whiteSpace="pre" highlight="lua">
          {code}
        </Console>
      </Fragment>
    );
  }
  return (
    <Fragment key={extraFile.name}>
      <Typography variant="h6">{`File: ${extraFile.name}`}</Typography>
      <Button
        onClick={() => {
          downloadFile(extraFile);
        }}
      >
        Download
      </Button>
    </Fragment>
  );
}

function downloadFile(extraFile: RPaasFile) {
  const byteCharacters = atob(extraFile.content);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: "application/octet-stream" });

  const blobUrl = URL.createObjectURL(blob);

  const anchorElement = document.createElement("a");

  document.body.appendChild(anchorElement);

  anchorElement.style.display = "none";

  anchorElement.href = blobUrl;
  anchorElement.download = extraFile.name;
  anchorElement.click();

  window.URL.revokeObjectURL(blobUrl);
}

export default RPaasBlocks;
