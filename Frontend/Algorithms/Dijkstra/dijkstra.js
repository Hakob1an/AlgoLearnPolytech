const graphData = {
    nodes: [
        { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }
    ],
    edges: [
        { source: 0, target: 1, weight: 4 },
        { source: 0, target: 2, weight: 2 },
        { source: 1, target: 2, weight: 5 },
        { source: 1, target: 3, weight: 10 },
        { source: 2, target: 3, weight: 3 },
        { source: 2, target: 4, weight: 6 },
        { source: 3, target: 4, weight: 2 }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    visualizeGraph(graphData, null, null);

    // Quiz button functionality
    const quizBtn = document.getElementById("startQuiz");
    if (quizBtn) {
        quizBtn.addEventListener("click", () => {
            window.location.href = "../../Quizzes/dijkstraquiz.html";
        });
    }

    // Start Dijkstra visualization button
    const startButton = document.getElementById("startDijkstraButton");
    if (startButton) {
        startButton.addEventListener("click", startDijkstraVisualization);
    }

    // Logout button functionality
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", (e) => {
            e.preventDefault();
            // Clear any local storage
            localStorage.removeItem("userEmail");
            localStorage.removeItem("token");
            // Redirect to login page
            window.location.href = "../../index.html";
        });
    }
});

// Function to Start Visualization (Uses Start & End Node Inputs)
function startDijkstraVisualization() {
    console.log("Dijkstra visualization started.");

    const startNode = parseInt(document.getElementById("start-node").value);
    const endNode = parseInt(document.getElementById("end-node").value);
    const container = document.getElementById("visualization");

    if (isNaN(startNode) || isNaN(endNode)) {
        alert("Խնդրում ենք ներմուծել վավեր սկիզբ և ավարտ:");
        return;
    }

    container.innerHTML = "<p>Գեներացնում ենք գրաֆը...</p>";

    // Example graph data - this represents the graph from the example in the HTML


    // Pass startNode and endNode to the visualizeGraph function
    visualizeGraph(graphData, startNode, endNode);
}

function visualizeGraph(graph, startNode, endNode) {
    console.log("Visualizing graph...");

    // Clear previous visualization
    d3.select("#visualization").html("");

    const width = 700, height = 500;
    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create a fixed node layout for better positioning
    // These positions are predefined to ensure no collisions
    const nodePositions = {
        0: { x: width * 0.2, y: height * 0.5 },
        1: { x: width * 0.3, y: height * 0.8 },
        2: { x: width * 0.5, y: height * 0.2 },
        3: { x: width * 0.7, y: height * 0.5 },
        4: { x: width * 0.8, y: height * 0.8 }
    };

    // Assign fixed positions to nodes
    graph.nodes.forEach(node => {
        node.fx = nodePositions[node.id].x;
        node.fy = nodePositions[node.id].y;
    });

    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.edges).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(40)) // Add collision detection
        .alphaDecay(0.05); // Slower decay for more stable layout

    // Draw edges with weight labels
    const link = svg.selectAll("line")
        .data(graph.edges)
        .enter().append("line")
        .attr("stroke", "gray")
        .attr("stroke-width", 2);

    // Draw edge weights
    const edgeLabels = svg.selectAll(".edge-weight")
        .data(graph.edges)
        .enter().append("text")
        .attr("class", "edge-weight")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "#555")
        .attr("dy", -5) // Offset above the line
        .text(d => d.weight);

    // Draw nodes
    const node = svg.selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 25) // Slightly larger radius
        .attr("fill", "lightblue")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Node labels
    const text = svg.selectAll("text.node-label")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "node-label")
        .attr("text-anchor", "middle")
        .attr("dy", 5)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(d => d.id);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        // Adjust edge label positions to avoid overlap
        edgeLabels
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2 - 10);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        text
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    // Run Dijkstra's algorithm on the graph
    const ok = Number.isInteger(startNode) && Number.isInteger(endNode);
    if (ok) {
        runDijkstra(graph, node, link, startNode, endNode);
    }
}

async function runDijkstra(graph, node, link, source, destination) {
    console.log(`Running Dijkstra's algorithm from node ${source} to node ${destination}...`);

    let distances = {};
    let previous = {};
    let unvisited = new Set();

    // Initialize distances
    graph.nodes.forEach(n => {
        distances[n.id] = Infinity;
        previous[n.id] = null;
        unvisited.add(n.id);
    });

    // Set source distance to 0
    distances[source] = 0;

    // Mark start node as green
    node.filter(d => d.id === source)
        .transition()
        .duration(500)
        .attr("fill", "green");

    await delay(500);

    while (unvisited.size > 0) {
        // Find node with minimum distance
        let minNode = Array.from(unvisited)
            .reduce((a, b) => (distances[a] < distances[b] ? a : b));

        // If we've reached the destination or all remaining nodes are unreachable
        if (minNode === destination || distances[minNode] === Infinity) {
            break;
        }

        unvisited.delete(minNode);

        // Mark current node as visited (light green)
        if (minNode !== source) {
            node.filter(d => d.id === minNode)
                .transition()
                .duration(500)
                .attr("fill", "#90EE90"); // Light Green
        }

        await delay(500);

        // Process all neighbors of current node
        const neighbors = graph.edges.filter(edge =>
            edge.source.id === minNode || edge.target.id === minNode
        );

        for (const edge of neighbors) {
            const neighbor = edge.source.id === minNode ? edge.target.id : edge.source.id;

            if (!unvisited.has(neighbor)) continue;

            const newDist = distances[minNode] + edge.weight;

            // Highlight edge being considered
            link.filter(d =>
                (d.source.id === minNode && d.target.id === neighbor) ||
                (d.target.id === minNode && d.source.id === neighbor)
            )
                .transition()
                .duration(300)
                .attr("stroke", "orange")
                .attr("stroke-width", 3);

            await delay(300);

            // Update distance if we found a shorter path
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = minNode;

                // Highlight edge when distance is updated
                link.filter(d =>
                    (d.source.id === minNode && d.target.id === neighbor) ||
                    (d.target.id === minNode && d.source.id === neighbor)
                )
                    .transition()
                    .duration(300)
                    .attr("stroke", "blue")
                    .attr("stroke-width", 4);
            }

            await delay(300);

            // Reset edge to gray
            link.filter(d =>
                (d.source.id === minNode && d.target.id === neighbor) ||
                (d.target.id === minNode && d.source.id === neighbor)
            )
                .transition()
                .duration(300)
                .attr("stroke", "gray")
                .attr("stroke-width", 2);
        }

        await delay(300);
    }

    // Trace the shortest path from destination to source
    if (distances[destination] !== Infinity) {
        // Create the path by backtracking from destination to source
        let pathNodes = [];
        let current = destination;

        while (current !== null) {
            pathNodes.unshift(current);
            current = previous[current];
        }

        console.log("Shortest path:", pathNodes.join(" → "));
        console.log("Distance:", distances[destination]);

        // Highlight the final path
        for (let i = 0; i < pathNodes.length - 1; i++) {
            const from = pathNodes[i];
            const to = pathNodes[i + 1];

            // Highlight nodes in the path
            node.filter(d => d.id === from || d.id === to)
                .transition()
                .duration(500)
                .attr("fill", "green");

            // Highlight edges in the path
            link.filter(d =>
                (d.source.id === from && d.target.id === to) ||
                (d.target.id === from && d.source.id === to)
            )
                .transition()
                .duration(500)
                .attr("stroke", "green")
                .attr("stroke-width", 5);

            await delay(500);
        }

        const visContainer = d3.select(".visualization-container");
        const visualizationDiv = d3.select("#visualization");

        // Clear any existing result boxes first
        visualizationDiv.selectAll(".result-box").remove();

        // Display the result in a better position and styling
        const resultBox = visContainer
            .append("div")
            .attr("class", "result-box")
            .style("margin-top", "20px")
            .style("padding", "30px")
            .style("background-color", "#f0f8ff")
            .style("border", "1px solid #ccc")
            .style("border-radius", "5px");

        resultBox.append("div")
            .attr("class", "result-info")
            .style("font-weight", "bold")
            .style("margin-bottom", "5px")
            .text(`Ամենակարճ ճանապարհ ${source}-ից մինչև ${destination}: ${pathNodes.join(" → ")}`);

        resultBox.append("div")
            .attr("class", "result-info")
            .style("font-weight", "bold")
            .text(`Հեռավորություն: ${distances[destination]}`);
    } else {
        d3.select("#visualization")
            .append("div")
            .attr("class", "result-info")
            .style("margin-top", "20px")
            .style("padding", "10px")
            .style("background-color", "#fff0f0")
            .style("border", "1px solid #ffcccc")
            .style("border-radius", "5px")
            .style("color", "red")
            .style("font-weight", "bold")
            .text(`Ճանապարհ ${source}-ից մինչև ${destination} չի գտնվել:`);
    }
}

// Helper function to delay execution (for animation)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}