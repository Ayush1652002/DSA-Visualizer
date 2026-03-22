// Graph DFS — returns steps with node/edge highlights + hints

export const dfsCode = [
  { id: 0, text: 'dfs(node):',                  indent: 0 },
  { id: 1, text: 'if visited: return',          indent: 1 },
  { id: 2, text: 'mark visited',                indent: 1 },
  { id: 3, text: 'process node',                indent: 1 },
  { id: 4, text: 'for each neighbor:',          indent: 1 },
  { id: 5, text: 'if not visited:',             indent: 2 },
  { id: 6, text: 'dfs(neighbor)',               indent: 3 },
]

export function runGraphDFS(nodes, edges, startId) {
  const steps   = []
  const adj     = buildAdj(nodes, edges)
  const visited = new Set()

  steps.push({ line: 0, activeNode: startId, visitedNodes: [], activeEdge: null, stackDepth: 0, hint: `Start DFS from node ${startId}` })

  function dfs(node, depth) {
    steps.push({ line: 1, activeNode: node, visitedNodes: [...visited], activeEdge: null, stackDepth: depth, hint: `Visiting node ${node} — depth ${depth}` })

    if (visited.has(node)) {
      steps.push({ line: 1, activeNode: node, visitedNodes: [...visited], activeEdge: null, stackDepth: depth, hint: `Node ${node} already visited — skip` })
      return
    }

    visited.add(node)
    steps.push({ line: 2, activeNode: node, visitedNodes: [...visited], activeEdge: null, stackDepth: depth, hint: `Marked node ${node} as visited` })
    steps.push({ line: 3, activeNode: node, visitedNodes: [...visited], activeEdge: null, stackDepth: depth, hint: `Processing node ${node}` })

    for (const neighbor of (adj[node] || [])) {
      steps.push({ line: 4, activeNode: node, visitedNodes: [...visited], activeEdge: { from: node, to: neighbor }, stackDepth: depth, hint: `Checking neighbor ${neighbor}` })
      steps.push({ line: 5, activeNode: neighbor, visitedNodes: [...visited], activeEdge: { from: node, to: neighbor }, stackDepth: depth, hint: `Is node ${neighbor} visited?` })

      if (!visited.has(neighbor)) {
        steps.push({ line: 6, activeNode: neighbor, visitedNodes: [...visited], activeEdge: { from: node, to: neighbor }, stackDepth: depth + 1, hint: `Recursing into node ${neighbor}` })
        dfs(neighbor, depth + 1)
      }
    }
  }

  dfs(startId, 0)
  steps.push({ line: -1, activeNode: null, visitedNodes: [...visited], activeEdge: null, stackDepth: 0, hint: `DFS complete — visited ${visited.size} node(s)` })
  return steps
}

function buildAdj(nodes, edges) {
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    adj[e.from]?.push(e.to)
    adj[e.to]?.push(e.from)
  })
  return adj
}
