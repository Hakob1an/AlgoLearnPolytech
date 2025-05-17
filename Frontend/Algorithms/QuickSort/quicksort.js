document.addEventListener("DOMContentLoaded", () => {
    const algorithmName = "QuickSort";
    //const completeButton = document.getElementById("markCompleted");
    //const completedText = document.getElementById("completed-text");
    const startButton = document.getElementById("startSortingButton");
    const userEmail = localStorage.getItem("userEmail"); // Get user email from localStorage

    if (!userEmail) {
        console.warn("⚠️ User email is missing.");
        return;
    }

    const quizBtn = document.getElementById("startQuiz");
    if (quizBtn) {
        quizBtn.addEventListener("click", () => {
            window.location.href = "../../Quizzes/quicksortquiz.html";
        });
    }


    if (startButton) {
        startButton.addEventListener("click", startQuickSortVisualization);
    } else {
        console.warn("⚠️ 'startSortingButton' not found in the document.");
    }
});

//Function to Check If the Algorithm is Already Completed
async function checkCompletionStatus(userEmail, algorithmName, completeButton, completedText) {
    try {
        const response = await fetch(`${BASE_URL}/api/dashboard/completed/${userEmail}`);

        if (!response.ok) {
            console.warn("No completed topics found for user:", userEmail);
            return;
        }

        const completedTopics = await response.json();

        if (completedTopics.includes(algorithmName)) {
            console.log(`✅ ${algorithmName} is already marked as completed.`);
            completeButton.style.display = "none";
            completedText.style.display = "block";
        }
    } catch (error) {
        console.error("Error checking completion status:", error);
    }
}

//Function to Mark Algorithm as Completed
async function markAsCompleted(userEmail, algorithmName, completeButton, completedText) {
    try {
        const response = await fetch(`${BASE_URL}/api/dashboard/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Email: userEmail,
                TopicName: algorithmName
            })
        });

        const result = await response.json();
        if (response.ok) {
            console.log("✅ Algorithm marked as completed:", result);
            completeButton.style.display = "none";
            completedText.style.display = "block";
        } else {
            console.error("❌ Error marking completion:", result.message);
        }
    } catch (error) {
        console.error("❌ Error marking completion:", error);
    }
}

//QuickSort Visualization
async function startQuickSortVisualization() {
    let input = document.getElementById("numbers").value;
    let array = input.split(",").map(num => parseInt(num.trim())).filter(num => !isNaN(num));

    if (array.length > 0) {
        console.log("🔹 Starting QuickSort with array:", array);
        visualizeQuickSort(array);
    } else {
        alert("Խնդֆրում ենք ներմուծել վավեր թվեր:");
    }
}

//Visualization Function
async function visualizeQuickSort(array) {
    console.log("🎥 QuickSort visualization started.");
    const container = document.getElementById("visualization");
    container.innerHTML = ""; // Clear previous visualization

    let bars = array.map((value, index) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value * 5}px`; // Scale height
        bar.style.width = "40px";
        bar.style.margin = "3px";
        bar.style.backgroundColor = "#007BFF"; // Default blue color
        bar.style.transition = "height 0.5s, background-color 0.3s ease-in-out";
        bar.style.display = "flex";
        bar.style.alignItems = "flex-end"; // Align text at the bottom
        bar.style.justifyContent = "center";
        bar.style.color = "white";
        bar.style.fontSize = "14px";
        bar.style.fontWeight = "bold";
        bar.setAttribute("data-value", value);
        bar.textContent = value;
        container.appendChild(bar);
        return bar;
    });

    await quickSort(bars, 0, bars.length - 1);

    bars.forEach(bar => (bar.style.backgroundColor = "#28a745")); // Set all bars to green after sorting
}

//QuickSort Algorithm (with Debugging)
async function quickSort(bars, low, high) {
    if (low < high) {
        let pivotIndex = await partition(bars, low, high);
        console.log(`🔹 Pivot placed at index ${pivotIndex}`);

        await quickSort(bars, low, pivotIndex - 1);
        await quickSort(bars, pivotIndex + 1, high);
    }
}

//Partition Function (Now with Debugging)
async function partition(bars, low, high) {
    let pivotValue = parseInt(bars[high].getAttribute("data-value"));
    console.log(`🎯 Choosing pivot: ${pivotValue} at index ${high}`);

    let i = low - 1;

    bars[high].style.backgroundColor = "#FFD700"; // Mark pivot as gold
    await delay(500);

    for (let j = low; j < high; j++) {
        let valueJ = parseInt(bars[j].getAttribute("data-value"));
        console.log(`🔄 Comparing: ${valueJ} with pivot ${pivotValue}`);

        bars[j].style.backgroundColor = "#FF5733"; // Mark comparison bars as red
        await delay(500);

        if (valueJ < pivotValue) {
            i++;
            console.log(`✅ Swapping ${valueJ} with element at index ${i}`);
            swapBars(bars, i, j);
        }

        bars[j].style.backgroundColor = "#007BFF"; // Reset color
    }

    console.log(`🔄 Swapping pivot ${pivotValue} with element at index ${i + 1}`);
    swapBars(bars, i + 1, high);
    bars[high].style.backgroundColor = "#007BFF"; // Reset pivot color
    return i + 1;
}

//Swap Function with Debugging
function swapBars(bars, i, j) {
    let tempHeight = bars[i].style.height;
    let tempValue = bars[i].getAttribute("data-value");

    console.log(`🔀 Swapping ${tempValue} (index ${i}) with ${bars[j].getAttribute("data-value")} (index ${j})`);

    bars[i].style.height = bars[j].style.height;
    bars[i].setAttribute("data-value", bars[j].getAttribute("data-value"));
    bars[i].textContent = bars[j].textContent;

    bars[j].style.height = tempHeight;
    bars[j].setAttribute("data-value", tempValue);
    bars[j].textContent = tempValue;
}

//Delay Function (For Animation)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
