// Graph BFS — returns steps with node/edge highlights + hints

export const bfsCode = [
  { id: 0, text: 'queue = [start]',              indent: 0 },
  { id: 1, text: 'visited = {start}',            indent: 0 },
  { id: 2, text: 'while queue not empty:',       indent: 0 },
  { id: 3, text: 'node = queue.dequeue()',        indent: 1 },
  { id: 4, text: 'process node',                 indent: 1 },
  { id: 5, text: 'for each neighbor:',           indent: 1 },
  { id: 6, text: 'if not visited:',              indent: 2 },
  { id: 7, text: 'visited.add(neighbor)',        indent: 3 },
  { id: 8, text: 'queue.enqueue(neighbor)',      indent: 3 },
]

export function runGraphBFS(nodes, edges, startId) {
  const steps   = []
  const adj     = buildAdj(nodes, edges)
  const visited = new Set()
  const queue   = [startId]
  visited.add(startId)

  steps.push({ line: 0, activeNode: startId, visitedNodes: [...visited], activeEdge: null, queueSize: 1, hint: `Start BFS from node ${startId}` })
  steps.push({ line: 1, activeNode: startId, visitedNodes: [...visited], activeEdge: null, queueSize: 1, hint: `Mark node ${startId} as visited` })

  while (queue.length > 0) {
    steps.push({ line: 2, activeNode: null, visitedNodes: [...visited], activeEdge: null, queueSize: queue.length, hint: `Queue has ${queue.length} node(s)` })

    const node = queue.shift()
    steps.push({ line: 3, activeNode: node, visitedNodes: [...visited], activeEdge: null, queueSize: queue.length, hint: `Dequeued node ${node}` })
    steps.push({ line: 4, activeNode: node, visitedNodes: [...visited], activeEdge: null, queueSize: queue.length, hint: `Processing node ${node}` })

    for (const neighbor of (adj[node] || [])) {
      steps.push({ line: 5, activeNode: node, visitedNodes: [...visited], activeEdge: { from: node, to: neighbor }, queueSize: queue.length, hint: `Checking neighbor ${neighbor} of node ${node}` })
      steps.push({ line: 6, activeNode: neighbor, visitedNodes: [...visited], activeEdge: { from: node, to: neighbor }, queueSize: queue.length, hint: `Is node ${neighbor} visited?` })

      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        steps.push({ line: 7, activeNode: neighbor, visitedNodes: [...visited], activeEdge: { from: node, to: neighbor }, queueSize: queue.length + 1, hint: `Marked node ${neighbor} as visited` })
        steps.push({ line: 8, activeNode: neighbor, visitedNodes: [...visited], activeEdge: { from: node, to: neighbor }, queueSize: queue.length + 1, hint: `Enqueued node ${neighbor}` })
        queue.push(neighbor)
      }
    }
  }

  steps.push({ line: -1, activeNode: null, visitedNodes: [...visited], activeEdge: null, queueSize: 0, hint: `BFS complete — visited ${visited.size} node(s)` })
  return steps
}

function buildAdj(nodes, edges) {
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    adj[e.from]?.push(e.to)
    adj[e.to]?.push(e.from)   // undirected
  })
  return adj
}
