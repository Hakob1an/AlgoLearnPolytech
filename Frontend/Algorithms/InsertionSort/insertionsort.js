document.addEventListener("DOMContentLoaded", () => {
    const algorithmName = "InsertionSort";
    const startButton = document.getElementById("startSortingButton");
    const resetButton = document.getElementById("resetButton"); // Note: This button doesn't exist in HTML
    const speedSlider = document.getElementById("speedSlider"); // Note: This doesn't exist in HTML
    const stepButton = document.getElementById("stepButton"); // Note: This doesn't exist in HTML
    const statusText = document.getElementById("statusText"); // Note: This doesn't exist in HTML
    const userEmail = localStorage.getItem("userEmail"); // Get user email from localStorage

    if (!userEmail) {
        console.warn("⚠️ User email is missing.");
    }

    // Set up the quiz button
    const quizBtn = document.getElementById("startQuiz");
    if (quizBtn) {
        quizBtn.addEventListener("click", () => {
            window.location.href = "../../Quizzes/insertionsortquiz.html";
        });
    }

    // Initialize animation speed (default since slider doesn't exist in HTML)
    let animationSpeed = 500;
    
    // Animation control variables
    let sortingInProgress = false;
    let sortingPaused = false;
    let currentStep = { i: 1, j: 0, phase: 'start' };
    let arrayCopy = [];

    // Set up the start button
    if (startButton) {
        startButton.addEventListener("click", () => {
            if (!sortingInProgress) {
                startInsertionSortVisualization();
            } else {
                togglePause(); // Allow pausing if already sorting
            }
        });
    } else {
        console.warn("⚠️ 'startSortingButton' not found in the document.");
    }

    // Function to reset visualization
    function resetVisualization() {
        if (sortingInProgress) {
            sortingInProgress = false;
            sortingPaused = false;
            
            const container = document.getElementById("visualization");
            if (container) {
                // Recreate bars with original array if we have one
                if (arrayCopy.length > 0) {
                    container.innerHTML = "";
                    createBars(arrayCopy);
                    updateStatusText("Visualization reset. Ready to start.");
                }
            }
            
            // Reset control button
            if (startButton) startButton.textContent = "Սկսել սորտավորումը"; // Change to Armenian
        }
    }

    // Function to update status text with current operation
    function updateStatusText(text) {
        // Since statusText doesn't exist in HTML, we could either:
        // 1. Create it dynamically or
        // 2. Use console.log for debugging
        console.log(text);
    }

    // Function to toggle pause/resume
    function togglePause() {
        if (sortingInProgress) {
            sortingPaused = !sortingPaused;
            
            if (sortingPaused) {
                startButton.textContent = "Շարունակել"; // "Resume" in Armenian
                updateStatusText("Sorting paused. Click Resume to continue.");
            } else {
                startButton.textContent = "Դադարեցնել"; // "Pause" in Armenian
                continueSort();
            }
        }
    }

    // ✅ Insertion Sort Visualization
    async function startInsertionSortVisualization() {
        let input = document.getElementById("numbers").value;
        let array = input.split(",").map(num => parseInt(num.trim())).filter(num => !isNaN(num));

        if (array.length > 0) {
            console.log("🔹 Starting Insertion Sort with array:", array);
            arrayCopy = [...array]; // Store a copy of the original array
            sortingInProgress = true;
            sortingPaused = false;
            currentStep = { i: 1, j: 0, phase: 'start' };
            
            if (startButton) {
                startButton.textContent = "Դադարեցնել"; // "Pause" in Armenian
            }
            
            createBars(array);
            visualizeInsertionSort(array);
        } else {
            alert("Խնդրում ենք մուտքագրել վավեր թվեր՝ ստորակետով առանձնացված"); // Armenian message
        }
    }

    // Function to create bars
    function createBars(array) {
        const container = document.getElementById("visualization");
        container.innerHTML = ""; // Clear previous visualization

        // Calculate bar width based on array length and container width
        const containerWidth = container.clientWidth;
        const barWidth = Math.min(40, Math.floor((containerWidth - (array.length * 6)) / array.length));
        
        array.forEach((value, index) => {
            const bar = document.createElement("div");
            bar.classList.add("bar");
            bar.style.height = `${value * 5}px`; // Scale height
            bar.style.width = `${barWidth}px`;
            bar.style.margin = "3px";
            bar.style.backgroundColor = "#007BFF"; // Default blue color
            bar.style.transition = "height 0.5s, background-color 0.3s ease-in-out";
            bar.style.display = "flex";
            bar.style.alignItems = "flex-end"; // Align text at the bottom
            bar.style.justifyContent = "center";
            bar.style.color = "white";
            bar.style.fontSize = "14px";
            bar.style.fontWeight = "bold";
            bar.style.borderRadius = "5px 5px 0 0"; // Rounded top corners
            bar.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)"; // Add subtle shadow
            bar.setAttribute("data-value", value);
            bar.setAttribute("data-index", index);
            bar.textContent = value;
            container.appendChild(bar);
        });
    }

    // Function to perform a single step of the sorting algorithm
    async function performSingleStep() {
        if (!sortingInProgress || !sortingPaused) return;
        
        const bars = document.querySelectorAll("#visualization .bar");
        const { i, j, phase } = currentStep;
        
        if (i >= bars.length) {
            finishSorting(bars);
            return;
        }
        
        if (phase === 'start') {
            // Starting a new iteration for i
            let keyValue = parseInt(bars[i].getAttribute("data-value"));
            let keyHeight = bars[i].style.height;
            
            // Reset colors from previous iteration
            bars.forEach(b => b.style.backgroundColor = "#007BFF");
            
            // Highlight current element
            bars[i].style.backgroundColor = "#FF9800"; // Orange for key element
            bars[i].classList.add("active");
            
            updateStatusText(`Considering element at index ${i}: ${keyValue}`);
            
            // Setup for comparison phase
            currentStep = { i, j: i - 1, phase: 'compare', keyValue, keyHeight, keyText: bars[i].textContent };
        } 
        else if (phase === 'compare') {
            const { keyValue, keyHeight, keyText } = currentStep;
            
            if (j >= 0 && parseInt(bars[j].getAttribute("data-value")) > keyValue) {
                // Comparing and shifting
                bars[j].style.backgroundColor = "#DC3545"; // Red for comparing element
                
                updateStatusText(`${bars[j].textContent} > ${keyValue}, so shifting ${bars[j].textContent} to the right`);
                
                // Shift the element right
                bars[j + 1].style.height = bars[j].style.height;
                bars[j + 1].setAttribute("data-value", bars[j].getAttribute("data-value"));
                bars[j + 1].textContent = bars[j].textContent;
                
                // Continue comparing with next element to the left
                currentStep = { i, j: j - 1, phase: 'compare', keyValue, keyHeight, keyText };
            } else {
                // Found the right position to insert
                updateStatusText(`Inserting ${keyValue} at position ${j + 1}`);
                
                bars[j + 1].style.height = keyHeight;
                bars[j + 1].setAttribute("data-value", keyValue);
                bars[j + 1].textContent = keyText;
                bars[j + 1].style.backgroundColor = "#28a745"; // Green for inserted element
                
                if (i < bars.length - 1) {
                    // Move to next i
                    currentStep = { i: i + 1, j: 0, phase: 'start' };
                    bars[i].classList.remove("active");
                } else {
                    // Sorting complete
                    finishSorting(bars);
                }
            }
        }
    }

    // Function to continue sorting after pause
    async function continueSort() {
        if (!sortingInProgress || sortingPaused) return;
        
        const bars = document.querySelectorAll("#visualization .bar");
        
        while (currentStep.i < bars.length && !sortingPaused) {
            await performSingleStep();
            await delay(animationSpeed);
        }
    }

    // Function to finish sorting
    function finishSorting(bars) {
        sortingInProgress = false;
        sortingPaused = false;
        
        // Mark all elements as sorted (green)
        bars.forEach(bar => {
            bar.style.backgroundColor = "#28a745";
            bar.classList.remove("active");
        });
        
        updateStatusText("Սորտավորումն ավարտված է! ✅"); // "Sorting completed!" in Armenian
        console.log("✅ Sorting completed.");
        
        if (startButton) {
            startButton.textContent = "Սկսել սորտավորումը"; // Reset button text in Armenian
        }
    }

    // ✅ Visualization Function
    async function visualizeInsertionSort(array) {
        console.log("🎥 Insertion Sort visualization started.");
        updateStatusText("Սկսում ենք ներդրմամբ սորտավորման վիզուալիզացիան..."); // Armenian message
        
        const bars = document.querySelectorAll("#visualization .bar");
        
        for (let i = 1; i < bars.length && sortingInProgress; i++) {
            if (sortingPaused) {
                currentStep = { i, j: i - 1, phase: 'start' };
                return; // Exit the loop and wait for resume or step
            }
            
            let keyValue = parseInt(bars[i].getAttribute("data-value"));
            let keyHeight = bars[i].style.height;
            let keyText = bars[i].textContent;
            
            // Reset colors from previous iteration
            bars.forEach(b => b.style.backgroundColor = "#007BFF");
            
            // Highlight current element
            bars[i].style.backgroundColor = "#FF9800"; // Orange for key element
            bars[i].classList.add("active");
            
            updateStatusText(`Դիտարկում ենք տարրը ինդեքսով ${i}: ${keyValue}`); // Armenian message
            await delay(animationSpeed);
            
            let j = i - 1;
            
            // Move elements forward while key is smaller
            while (j >= 0 && parseInt(bars[j].getAttribute("data-value")) > keyValue) {
                if (sortingPaused) {
                    currentStep = { i, j, phase: 'compare', keyValue, keyHeight, keyText };
                    return; // Exit the loop and wait for resume or step
                }
                
                bars[j].style.backgroundColor = "#DC3545"; // Red for comparing element
                
                updateStatusText(`${bars[j].textContent} > ${keyValue}, տեղաշարժում ենք ${bars[j].textContent} դեպի աջ`); // Armenian message
                await delay(animationSpeed);
                
                // Shift the element right
                bars[j + 1].style.height = bars[j].style.height;
                bars[j + 1].setAttribute("data-value", bars[j].getAttribute("data-value"));
                bars[j + 1].textContent = bars[j].textContent;
                
                j--;
            }
            
            updateStatusText(`Ներդնում ենք ${keyValue}-ը դիրքում ${j + 1}`); // Armenian message
            
            // Insert key into correct position
            bars[j + 1].style.height = keyHeight;
            bars[j + 1].setAttribute("data-value", keyValue);
            bars[j + 1].textContent = keyText;
            bars[j + 1].style.backgroundColor = "#28a745"; // Green for inserted element
            
            await delay(animationSpeed);
            bars[i].classList.remove("active");
        }
        
        // Mark all elements as sorted (green)
        if (sortingInProgress && !sortingPaused) {
            finishSorting(bars);
        }
    }

    // ✅ Delay Function (For Animation)
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Set up the logout button
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("userEmail");
            window.location.href = "../../index.html";
        });
    }
});