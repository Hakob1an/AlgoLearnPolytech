console.log("📌 Binary Search Tree visualization script loaded.");

// Helper for animation delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// BST Node
class BSTNode {
    static _counter = 0;
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.nodeID = BSTNode._counter++;
    }
}

// BST Class
class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    insert(value) {
        if (!this.root) {
            this.root = new BSTNode(value);
        } else {
            this._insertNode(this.root, value);
        }
        this.updateVisualization();
    }

    _insertNode(node, value) {
        if (value < node.value) {
            if (!node.left) {
                node.left = new BSTNode(value);
            } else {
                this._insertNode(node.left, value);
            }
        } else {
            if (!node.right) {
                node.right = new BSTNode(value);
            } else {
                this._insertNode(node.right, value);
            }
        }
    }

    async search(value) {
        let current = this.root;
        let path = [];
    
        while (current) {
            // Grab the DOM element for the current node
            let nodeElement = document.getElementById(`node-${current.nodeID}`);
            if (!nodeElement) break; 
    
            // Highlight the node as "searching"
            nodeElement.classList.add("searching");
            path.push(nodeElement);
    
            await sleep(500); // Delay to visualize
    
            // Check if we found the value
            if (value === current.value) {
                // This node is found - highlight in green
                nodeElement.classList.remove("searching");
                nodeElement.classList.add("found");
    
                await sleep(800);
    
                // Remove "searching" from all path nodes
                path.forEach(elem => elem.classList.remove("searching"));
                return; // Done
            }
    
            // Move left or right
            current = value < current.value ? current.left : current.right;
        }
    
        // If we exit the loop, not found
        alert("Հանգույցը չի գտնվել:");
    
        // Remove leftover "searching" from any path nodes
        path.forEach(elem => elem.classList.remove("searching"));
    }    

    async delete(value) {
        if (!this.root) {
            alert("Ծառը դատարկ է:");
            return;
        }
    
        let path = [];
        this.root = await this._deleteNode(this.root, value, path);
    
        // Remove highlight from the path nodes
        await sleep(500);
        path.forEach(node => {
            let nodeElement = document.getElementById(`node-${node.nodeID}`);
            if (nodeElement) {
                nodeElement.classList.remove("searching");
            }
        });
    
        this.updateVisualization();
    }
    
    async _deleteNode(node, value, path) {
        if (!node) {
            alert("Հանգույցը չի գտնվել:");
            return null;
        }
    
        let nodeElement = document.getElementById(`node-${node.nodeID}`);
        // Highlight path node
        if (nodeElement) {
            nodeElement.classList.add("searching");
            await sleep(500);
        }
        path.push(node);
    
        if (value < node.value) {
            node.left = await this._deleteNode(node.left, value, path);
        } else if (value > node.value) {
            node.right = await this._deleteNode(node.right, value, path);
        } else {
            // The node to be deleted is found:
            if (nodeElement) {
                // Remove "searching" highlight
                nodeElement.classList.remove("searching");
                // Mark as "deleted" (red)
                nodeElement.classList.add("deleted");
            }
            await sleep(800);
    
            // Actual BST deletion logic:
            // 1) No children
            if (!node.left && !node.right) {
                return null;
            }
            // 2) One child
            else if (!node.left) {
                return node.right;
            } else if (!node.right) {
                return node.left;
            }
            // 3) Two children
            else {
                let successor = this._minValueNode(node.right);
                let successorElement = document.getElementById(`node-${successor.nodeID}`);
                if (successorElement) {
                    successorElement.classList.add("searching");
                    await sleep(800);
                    successorElement.classList.remove("searching");
                }
                // Replace node’s value with successor’s value
                node.value = successor.value;
                // Delete the successor
                node.right = await this._deleteNode(node.right, successor.value, path);
            }
        }
        return node;
    }    

    _minValueNode(node) {
        while (node.left) node = node.left;
        return node;
    }

    // Visualization
    updateVisualization() {
        let container = document.getElementById("visualization");
        container.innerHTML = "";
        container.style.position = "relative";
        container.style.overflow = "visible";
        this._displayTree(this.root, container, 300, 50, 150);
    }

    _displayTree(node, parentDiv, x, y, spacing) {
        if (!node) return;
        const nodeRadius = 25;

        let nodeDiv = document.createElement("div");
        nodeDiv.classList.add("bst-node");
        nodeDiv.id = `node-${node.nodeID}`;
        nodeDiv.setAttribute("data-value", node.value);
        nodeDiv.style.left = `${x - nodeRadius}px`;
        nodeDiv.style.top  = `${y - nodeRadius}px`;
        nodeDiv.textContent = node.value;
        parentDiv.appendChild(nodeDiv);

        let newSpacing = Math.max(spacing / 1.5, 50);

        if (node.left) {
            let childX = x - newSpacing;
            let childY = y + 80;
            this._drawLine(parentDiv, x, y, childX, childY);
            this._displayTree(node.left, parentDiv, childX, childY, newSpacing);
        }

        if (node.right) {
            let childX = x + newSpacing;
            let childY = y + 80;
            this._drawLine(parentDiv, x, y, childX, childY);
            this._displayTree(node.right, parentDiv, childX, childY, newSpacing);
        }
    }

    _drawLine(parentDiv, x1, y1, x2, y2) {
        let line = document.createElement("div");
        line.classList.add("bst-arrow");
        line.style.zIndex = "1000";

        const nodeRadius = 25;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const dist = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);

        // Start just outside the parent node
        let startX = x1 + nodeRadius * Math.cos(angle);
        let startY = y1 + nodeRadius * Math.sin(angle);

        // End just outside the child node
        let endX = x2 - nodeRadius * Math.cos(angle);
        let endY = y2 - nodeRadius * Math.sin(angle);

        let lineLength = Math.sqrt((endX - startX)**2 + (endY - startY)**2);

        line.style.position = "absolute";
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
        line.style.width = `${lineLength}px`;
        line.style.height = "2px";
        line.style.backgroundColor = "black";
        line.style.transformOrigin = "0 50%";
        line.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;

        // Arrowhead
        let arrowhead = document.createElement("div");
        arrowhead.classList.add("arrowhead");
        arrowhead.style.position = "absolute";
        arrowhead.style.zIndex = "1001";
        arrowhead.style.left = `${lineLength - 6}px`;
        arrowhead.style.top = "-4px";
        arrowhead.style.width = "0";
        arrowhead.style.height = "0";
        arrowhead.style.borderLeft = "6px solid black";
        arrowhead.style.borderTop = "4px solid transparent";
        arrowhead.style.borderBottom = "4px solid transparent";

        line.appendChild(arrowhead);
        parentDiv.appendChild(line);
    }
}

const bst = new BinarySearchTree();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnInsert").addEventListener("click", () => {
        let value = parseInt(document.getElementById("insertValue").value);
        if (!isNaN(value)) bst.insert(value);
    });

    document.getElementById("btnDelete").addEventListener("click", () => {
        let value = parseInt(document.getElementById("deleteValue").value);
        if (!isNaN(value)) bst.delete(value);
    });

    document.getElementById("btnSearch").addEventListener("click", () => {
        let value = parseInt(document.getElementById("searchValue").value);
        if (!isNaN(value)) bst.search(value);
    });

    const quizBtn = document.getElementById("startQuiz");
    if (quizBtn) {
        quizBtn.addEventListener("click", () => {
            window.location.href = "../../Quizzes/bstquiz.html";
        });
    }
});



/***********************************************************************
 *  3. "Mark as Completed" Feature
//  ***********************************************************************/
// async function checkCompletionFeature() {
//     const completeButton = document.getElementById("markCompleted");
//     const completedText  = document.getElementById("completed-text");
//     const userEmail = localStorage.getItem("userEmail");

//     if (!userEmail) {
//         console.error("No user email found in localStorage.");
//         completeButton.style.display = "none";
//         return;
//     }
    
//     // Check if the user has already completed "BinarySearchTree"
//     await checkCompletionStatus(userEmail, completeButton, completedText);

//     // On button click, mark as completed
//     completeButton.addEventListener("click", () => {
//         markAsCompleted(userEmail, completeButton, completedText);
//     });
// }

// async function checkCompletionStatus(userEmail, completeButton, completedText) {
//     try {
//         const response = await fetch(`${BASE_URL}/api/dashboard/completed/${userEmail}`);
//         if (!response.ok) {
//             console.warn("No completed topics found for user:", userEmail);
//             return;
//         }

//         const completedTopics = await response.json();

//         // Check if "BinarySearchTree" is in the completed list from your backend
//         if (completedTopics.includes("BinarySearchTree")) {
//             console.log("✅ BinarySearchTree is already marked as completed.");
//             completeButton.style.display = "none";
//             completedText.style.display = "block";
//         }
//     } catch (error) {
//         console.error("Error checking completion status:", error);
//     }
// }

// async function markAsCompleted(userEmail, completeButton, completedText) {
//     console.log("➡️ Sending completion request for: BinarySearchTree");
//     try {
//         const response = await fetch(`${BASE_URL}/api/dashboard/complete`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 Email: userEmail,
//                 TopicName: "BinarySearchTree"
//             })
//         });

//         const result = await response.json();
//         console.log("⬅️ API Response:", result);

//         if (response.ok) {
//             console.log("✅ Data structure marked as completed!");
//             completeButton.style.display = "none";
//             completedText.style.display = "block";
//         } else {
//             console.error("❌ API Error:", result.message);
//         }
//     } catch (error) {
//         console.error("❌ Error marking completion:", error);
//     }
// }