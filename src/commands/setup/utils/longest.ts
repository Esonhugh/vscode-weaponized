/**
 * 计算 edges 图中的最长“引用路径”
 * 返回按顺序的节点 ID 数组（笔记路径）
 */
export function longestReferencePath(edges: {
  source: string;
  target: string;
}[]): string[] {
  if (!edges || edges.length === 0) { return []; };

  // ---- 收集节点并编号 ----
  const nodesSet = new Set<string>();
  edges.forEach(({ source, target }) => {
    nodesSet.add(source);
    nodesSet.add(target);
  });
  const nodes = Array.from(nodesSet);
  const idOf = new Map<string, number>();
  nodes.forEach((n, i) => idOf.set(n, i));
  const n = nodes.length;

  // ---- 原图邻接表 ----
  const g: number[][] = Array.from({ length: n }, () => []);
  // 记录每个节点在 edges 中的首次出现位置，便于 SCC 内稳定排序
  const firstSeen: number[] = Array(n).fill(Infinity);

  edges.forEach((e, idx) => {
    const u = idOf.get(e.source)!;
    const v = idOf.get(e.target)!;
    g[u].push(v);
    firstSeen[u] = Math.min(firstSeen[u], idx);
    firstSeen[v] = Math.min(firstSeen[v], idx);
  });

  // ---- Tarjan SCC ----
  let time = 0;
  const dfn = Array(n).fill(-1);
  const low = Array(n).fill(-1);
  const onStack = Array(n).fill(false);
  const stack: number[] = [];
  const compId = Array(n).fill(-1);
  const comps: number[][] = []; // 每个 SCC 的节点列表

  function tarjan(u: number) {
    dfn[u] = low[u] = time++;
    stack.push(u);
    onStack[u] = true;

    for (const v of g[u]) {
      if (dfn[v] === -1) {
        tarjan(v);
        low[u] = Math.min(low[u], low[v]);
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], dfn[v]);
      }
    }

    // 形成一个 SCC
    if (low[u] === dfn[u]) {
      const comp: number[] = [];
      while (true) {
        const x = stack.pop()!;
        onStack[x] = false;
        compId[x] = comps.length;
        comp.push(x);
        if (x === u) {
          break;
        }
      }
      comps.push(comp);
    }
  }

  // for (let i = 0; i < n; i++) if (dfn[i] === -1) tarjan(i);
  for (let i = 0; i < n; i++) {
    if (dfn[i] === -1) {
      tarjan(i);
    }
  }

  const C = comps.length;
  if (C === 0) {
    return [];
  }

  // ---- 缩点成 DAG ----
  const dag: number[][] = Array.from({ length: C }, () => []);
  const indeg = Array(C).fill(0);
  const compSize = comps.map((c) => c.length);

  const seenEdge = new Set<string>();
  for (let u = 0; u < n; u++) {
    for (const v of g[u]) {
      const cu = compId[u],
        cv = compId[v];
      if (cu !== cv) {
        const key = `${cu}->${cv}`;
        if (!seenEdge.has(key)) {
          seenEdge.add(key);
          dag[cu].push(cv);
          indeg[cv]++;
        }
      }
    }
  }

  // ---- DAG 上求最长路（以“节点数”为长度）----
  const dist = Array(C).fill(-Infinity);
  const parent = Array(C).fill(-1);
  const q: number[] = [];

  for (let c = 0; c < C; c++) {
    if (indeg[c] === 0) {
      dist[c] = compSize[c];
      q.push(c);
    }
  }

  // 拓扑序 DP
  const topo: number[] = [];
  const indegTmp = indeg.slice();
  while (q.length) {
    const u = q.shift()!;
    topo.push(u);
    for (const v of dag[u]) {
      if (dist[u] + compSize[v] > dist[v]) {
        dist[v] = dist[u] + compSize[v];
        parent[v] = u;
      }
      if (--indegTmp[v] === 0) {
        q.push(v);
      }
    }
  }

  // 可能图里有不连通，找 dist 最大的终点
  let end = 0;
  // for (let c = 1; c < C; c++) if (dist[c] > dist[end]) end = c;
  for (let c = 1; c < C; c++) {
    if (dist[c] > dist[end]) {
      end = c;
    }
  }

  // 回溯出组件路径
  const compPath: number[] = [];
  for (let x = end; x !== -1; x = parent[x]) {
    compPath.push(x);
  }
  compPath.reverse();

  // ---- 展开组件为节点路径 ----
  // 对于 SCC（可能含环），用“首次出现次序 + 名字”稳定排序
  function expandComp(comp: number[]): number[] {
    if (comp.length === 1) {
      return comp.slice();
    }
    return comp.slice().sort((a, b) => {
      const fa = firstSeen[a],
        fb = firstSeen[b];
      if (fa !== fb) {
        return fa - fb;
      }
      const sa = nodes[a],
        sb = nodes[b];
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    });
  }

  const pathNodeIds: number[] = [];
  for (const c of compPath) {
    const expanded = expandComp(comps[c]);
    for (const v of expanded) {
      // 避免组件之间展开后出现相邻重复
      if (
        pathNodeIds.length === 0 ||
        pathNodeIds[pathNodeIds.length - 1] !== v
      ) {
        pathNodeIds.push(v);
      }
    }
  }

  // 转回节点字符串 ID（你的笔记路径）
  return pathNodeIds.map((i) => nodes[i]);
}

(() => {
  console.log("start");

  const edges = [
    { source: "/x", target: "/y" },
    { source: "/y", target: "/z" },
    { source: "/c", target: "/d" },
    { source: "/b", target: "/x" },
    { source: "/b", target: "/c" },
    { source: "/a", target: "/b" },
  ];

  const path = longestReferencePath(edges);
  console.log(path);
  // 例：["/a","/b","/c", "/x","/y"]  （具体顺序视输入而定）
})();
