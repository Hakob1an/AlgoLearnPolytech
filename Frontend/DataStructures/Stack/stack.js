// Global variable for stack visualization container
let stackVisualization;

document.addEventListener("DOMContentLoaded", () => {
    const algorithmName = "Stack";
    // const completeButton = document.getElementById("markCompleted");
    // const completedText = document.getElementById("completed-text");
    const pushButton = document.getElementById("pushButton");
    const popButton = document.getElementById("popButton");
    stackVisualization = document.getElementById("visualization");
    const userEmail = localStorage.getItem("userEmail");

    // Check if user email is available
    if (!userEmail) {
        console.warn("User email is missing.");
        return;
    }

    // Check if the stack algorithm is already completed
    const quizBtn = document.getElementById("startQuiz");
    if (quizBtn) {
        quizBtn.addEventListener("click", () => {
            window.location.href = "../../Quizzes/stackquiz.html";
        });
    }


    // Add event listeners to the stack operation buttons
    if (pushButton) {
        pushButton.addEventListener("click", pushToStack);
    }

    if (popButton) {
        popButton.addEventListener("click", popFromStack);
    }
});

// Function to check if the algorithm has already been marked as completed
// async function checkCompletionStatus(userEmail, algorithmName, completeButton, completedText) {
//     try {
//         const response = await fetch(`${BASE_URL}/api/dashboard/completed/${userEmail}`);

//         if (!response.ok) {
//             console.warn("No completed topics found for user:", userEmail);
//             return;
//         }

//         const completedTopics = await response.json();

//         if (completedTopics.includes(algorithmName)) {
//             console.log(`${algorithmName} is already marked as completed.`);
//             completeButton.style.display = "none";
//             completedText.style.display = "block";
//         }
//     } catch (error) {
//         console.error("Error checking completion status:", error);
//     }
// }

// // Function to mark the algorithm as completed
// async function markAsCompleted(userEmail, algorithmName, completeButton, completedText) {
//     try {
//         const response = await fetch(`${BASE_URL}/api/dashboard/complete`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 Email: userEmail,
//                 TopicName: algorithmName
//             })
//         });

//         const result = await response.json();
//         if (response.ok) {
//             console.log("Algorithm marked as completed:", result);
//             completeButton.style.display = "none";
//             completedText.style.display = "block";
//         } else {
//             console.error("Error marking completion:", result.message);
//         }
//     } catch (error) {
//         console.error("Error marking completion:", error);
//     }
// }

// Stack operations array
const stack = [];

// Function to push a value onto the stack
function pushToStack() {
    const stackInput = document.getElementById("stackInput");
    const value = stackInput.value.trim();

    if (value === "") {
        alert("Խնդրում ենք ներմուծել արժեք:");
        return;
    }

    stack.push(value);
    stackInput.value = ""; // Clear input field
    console.log(`Pushed: ${value}`);

    updateStackVisualization();
}

// Function to pop the top value from the stack
function popFromStack() {
    if (stack.length === 0) {
        alert("Ստեկը դատարկ է:");
        return;
    }

    const poppedValue = stack.pop();
    console.log(`Popped: ${poppedValue}`);

    updateStackVisualization();
}

// Function to update the stack visualization
function updateStackVisualization() {
    if (!stackVisualization) {
        console.error("stackVisualization is still undefined!");
        return;
    }

    stackVisualization.innerHTML = ""; // Clear previous stack display

    // Display stack items in reverse order to maintain Last In, First Out behavior
    stack.slice().reverse().forEach((value) => {
        const stackItem = document.createElement("div");
        stackItem.classList.add("stack-item");
        stackItem.textContent = value;
        stackVisualization.prepend(stackItem);
    });
}
