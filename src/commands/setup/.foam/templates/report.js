function generateFoamGraph(foam) {
  const graph = {
    nodeInfo: {},
    edges: new Set(),
  };
  foam.workspace.list().forEach(n => {
    const type = n.type === 'note' ? n.properties.type ?? 'note' : n.type;
    const title = n.type === 'note' ? n.title : n.uri.getBasename();
    graph.nodeInfo[n.uri.path] = {
      id: n.uri.path,
      type: type,
      uri: n.uri,
      title: title,
      properties: n.properties,
      tags: n.tags,
    };
  });
  foam.graph.getAllConnections().forEach(c => {
    graph.edges.add({
      source: c.source.path,
      target: c.target.path,
    });
  });
  console.log("Graph nodes:", graph.nodeInfo);
  console.log("Graph edges sets:", (Array.from(graph.edges)));
  return graph;
}

let title = "# "

async function createNote({ trigger, foam, resolver, foamDate }) {
  console.log("Creating note for trigger:", trigger);
  console.log("Foam instance:", Object.keys(foam));
  const graph = generateFoamGraph(foam);

  let userlist = [];
  let hostlist = [];
  let workspacename = foam.workspace;
  console.log("Workspace name:", JSON.stringify(workspacename));
  for (const [path, meta] of Object.entries(graph.nodeInfo)) {
    if (meta.type === "user") {
      userlist.push(meta);
    } else if (meta.type === "host") {
      hostlist.push(meta);
    } else {
      console.log(`Skipping node ${path} of type ${meta.type}`);
    }
  }


  return {
    filepath: "report.md",
    content: "",
  };
}
