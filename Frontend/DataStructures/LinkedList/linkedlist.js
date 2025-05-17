console.log("📌 Linked List visualization script loaded.");

// ✅ Define LinkedList Class
class LinkedList {
    constructor() {
        this.head = null;
    }

    insert(val) {
        let node = new Node(val);
        if (this.head === null) {
            this.head = node;
        } else {
            let ptr = this.head;
            while (ptr.next !== null) {
                ptr = ptr.next;
            }
            ptr.next = node;
        }
        displayNodes();
    }

    async delete(val) {
        val = Number.parseInt(val);
        if (this.head === null) {
            popup(false, "Ցուցակը դատարկ է:");
            return;
        }

        let ptr = this.head;
        let prev = null;

        while (ptr !== null) {
            let nodeEl = document.getElementById(`node-${ptr.data}`);
            if (!nodeEl) break;                       // safety

            /* 1️⃣ walk-the-path highlight */
            nodeEl.classList.add("ll-searching");
            await sleep(400);

            /* 2️⃣ found the node to delete */
            if (ptr.data === val) {
                nodeEl.classList.remove("ll-searching");
                nodeEl.classList.add("ll-deleting");  // red fade-out
                await sleep(600);                     // wait for the fade

                /* 3️⃣ unlink it from the list */
                if (prev === null) this.head = ptr.next;
                else prev.next = ptr.next;

                displayNodes();                      // 4️⃣ redraw clean list
                return;
            }

            nodeEl.classList.remove("ll-searching"); // reset colour
            prev = ptr;
            ptr = ptr.next;
        }
        popup(false, "Հանգույցը չի գտնվել:");
    }


    async search(n) {
        let current = this.head;
        while (current !== null) {
            let nodeElement = document.getElementById(`node-${current.data}`);
            nodeElement.style.backgroundColor = "yellow";
            await sleep(500);

            if (current.data === Number.parseInt(n)) {
                nodeElement.style.backgroundColor = "lightgreen";
                popup(true, `Գտնվել է հանգույց ${n} արժեքով:`);
                return;
            } else {
                nodeElement.style.backgroundColor = "";
            }
            current = current.next;
        }
        popup(false, "Հանգույցը չի գտնվել:");
    }
}

// ✅ Node Structure
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// ✅ Initialize Linked List
let linkedList = new LinkedList();

function displayNodes() {
    const parent = document.getElementById("visualization");
    parent.innerHTML = ""; // Clear previous visualization

    let current = linkedList.head;
    while (current !== null) {
        // 1️⃣ Create the node
        const nodeDiv = document.createElement("div");
        nodeDiv.classList.add("linkedlist-node");
        nodeDiv.id = `node-${current.data}`;

        // 2️⃣ Fill the node (data, etc.)
        const dataBox = document.createElement("div");
        dataBox.classList.add("data-box");
        dataBox.textContent = current.data;
        nodeDiv.appendChild(dataBox);

        // 3️⃣ Append node to the visualization container
        parent.appendChild(nodeDiv);

        // 4️⃣ If there's a next node, create & insert the arrow *after* the node
        if (current.next !== null) {
            const arrowContainer = document.createElement("div");
            arrowContainer.classList.add("arrow-container");

            const arrowStem = document.createElement("div");
            arrowStem.classList.add("arrow-stem");

            arrowContainer.appendChild(arrowStem);
            parent.appendChild(arrowContainer);
        }
        // 5️⃣ If there is no "next," you can optionally show a / or NULL pointer
        else {
            const nullPointer = document.createElement("div");
            nullPointer.classList.add("null-pointer");
            nullPointer.textContent = "/";
            parent.appendChild(nullPointer);
        }

        current = current.next;
    }
}


// ✅ Start Insertion
function startLinkedListInsertion() {
    let val = document.getElementById("insertInput").value;
    if (val !== "" && !isNaN(val)) {
        linkedList.insert(Number.parseInt(val));
        popup(true, `${val} թիվը հաջողությամբ ավելացվել է: `);
    } else {
        popup(false, "Մուտքագրեք վավեր թիվ:");
    }
    document.getElementById("insertInput").value = "";
}

// ✅ Start Deletion
function startLinkedListDeletion() {
    let val = document.getElementById("deleteInput").value;
    if (val !== "" && !isNaN(val)) {
        linkedList.delete(Number.parseInt(val));
    } else {
        popup(false, "Մուտքագրեք վավեր թիվ:");
    }
    document.getElementById("deleteInput").value = "";
}

// ✅ Start Search
function startLinkedListSearch() {
    let val = document.getElementById("searchInput").value;
    if (val !== "" && !isNaN(val)) {
        linkedList.search(Number.parseInt(val));
    } else {
        popup(false, "Մուտքագրեք վավեր թիվ:");
    }
    document.getElementById("searchInput").value = "";
}

// ✅ Helper Function: Delay Execution for Animation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ✅ Load and visualize Linked List dynamically
function loadLinkedListVisualization() {
    console.log("📌 Linked List visualization script loaded.");

    const container = document.getElementById("visualization");
    if (!container) {
        console.error("❌ ERROR: 'visualization' container not found.");
        return;
    }

    container.innerHTML = "";
    console.log("🧹 Cleared visualization container.");

    // Create notification container if it doesn't exist
    if (!document.getElementById("notification-container")) {
        createNotificationContainer();
    }

    displayNodes();
}

// ✅ Modern Notification System
function createNotificationContainer() {
    const container = document.createElement("div");
    container.id = "notification-container";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "1000";
    document.body.appendChild(container);
}

// ✅ Show Notification
function popup(success, message) {
    // Make sure container exists
    let container = document.getElementById("notification-container");
    if (!container) {
        createNotificationContainer();
        container = document.getElementById("notification-container");
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.style.backgroundColor = success ? "#4CAF50" : "#f44336"; // Green for success, red for error
    notification.style.color = "white";
    notification.style.padding = "12px 16px";
    notification.style.marginBottom = "10px";
    notification.style.borderRadius = "4px";
    notification.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    notification.style.minWidth = "250px";
    notification.style.position = "relative";
    notification.style.animation = "slideIn 0.5s forwards";
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";

    // Add message
    notification.textContent = message;

    // Add to container
    container.appendChild(notification);

    // Add CSS animation styles if not already added
    if (!document.getElementById("notification-styles")) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "notification-styles";
        styleSheet.textContent = `
            @keyframes slideIn {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = "fadeOut 0.5s forwards";
        setTimeout(() => {
            if (notification.parentNode === container) {
                container.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// ✅ Run UI setup immediately
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnInsert").addEventListener("click", startLinkedListInsertion);
    document.getElementById("btnDelete").addEventListener("click", startLinkedListDeletion);
    document.getElementById("btnSearch").addEventListener("click", startLinkedListSearch);
    loadLinkedListVisualization();
    const quizBtn = document.getElementById("startQuiz");
    if (quizBtn) {
        quizBtn.addEventListener("click", () => {
            window.location.href = "../../Quizzes/linkedlistquiz.html";
        });
    }
});