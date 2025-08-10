function generateFoamGraph(foam) {
  const graph = {
    nodeInfo: {},
    edges: new Set(),
    userEdges: new Set(),
  };
  foam.workspace.list().forEach((n) => {
    const type = n.type === "note" ? n.properties.type ?? "note" : n.type;
    const title = n.type === "note" ? n.title : n.uri.getBasename();
    graph.nodeInfo[n.uri.path] = {
      id: n.uri.path,
      type: type,
      uri: n.uri,
      title: title,
      properties: n.properties,
      tags: n.tags,
    };
  });
  foam.graph.getAllConnections().forEach((c) => {
    const sourcePath = c.source.path;
    const targetPath = c.target.path;
    graph.edges.add({
      source: sourcePath,
      target: targetPath,
    });
    const sourceNode = graph.nodeInfo[sourcePath];
    const targetNode = graph.nodeInfo[targetPath];
    if (sourceNode && targetNode && targetNode.type === "user") {
      graph.userEdges.add({
        source: sourceNode.id,
        target: targetNode.id,
      });
    }
  });
  // console.log("Graph nodes:", graph.nodeInfo);
  // console.log("Graph edges: ", foam.graph.getAllConnections());
  // console.log("Graph edges sets:", (Array.from(graph.edges)));
  // console.log("Graph user edges sets:", (Array.from(graph.userEdges)));
  return graph;
}


function FindUserPrivilegeEscalationPath ({
  nodeInfo,
  edges
}) {

}

let meta = `---
title: Final Report
type: report
---

# Final Report

`;

function ReturnBad() {
  return "bad";
}

async function createNote({ trigger, foam, resolver, foamDate }) {
  console.log("Creating note for trigger:", trigger);
  console.log("Foam instance:", Object.keys(foam));
  const graph = generateFoamGraph(foam);
  console.log("Generated graph!");

  let userNoteList = [];
  let hostNoteList = [];
  for (const [path, meta] of Object.entries(graph.nodeInfo)) {
    if (meta.type === "user") {
      userNoteList.push(meta);
    } else if (meta.type === "host") {
      hostNoteList.push(meta);
    } else {
      console.log(`Skipping node ${path} of type ${meta.type}`);
    }
  }

  let hostInformation = hostNoteList.map((hostMeta) => {
    return `## Host: ${hostMeta.title}

![[${hostMeta.uri.path}]]
`;
  });
  let userInformation = userNoteList.map((userMeta) => {
    return `## User: ${userMeta.title}

![[${userMeta.uri.path}]]
`;
  });

  let body = `## Hosts Information

${hostInformation.join("\n")}
## Users Information

${userInformation.join("\n")}
`;

  return ReturnBad();
  return {
    filepath: "report.md",
    content: meta + body,
  };
}
