/**
 * On DOM load:
 * - Check if user is logged in
 * - Hook up "Start Quiz" button
 * - Hook up "Start Sorting" button for visualization
 * - Create notification container
 */
document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    console.warn("⚠️ No user is logged in.");
    // Optionally redirect or show a message
  }

  // Create notification container
  createNotificationContainer();

  // "Start Sorting" bubble sort
  const startButton = document.getElementById("startSortingButton");
  if (startButton) {
    startButton.addEventListener("click", startBubbleSortVisualization);
  } else {
    console.warn("⚠️ 'startSortingButton' not found.");
  }

  // "Start Quiz" button
  const quizButton = document.getElementById("startQuiz");
  if (quizButton) {
    quizButton.addEventListener("click", () => {
      // Replace with the EXACT topic name in your DB, e.g. "BubbleSort"
      window.location.href = "../../Quizzes/bubblesortquiz.html";
    });
  } else {
    console.warn("⚠️ 'startQuiz' button not found.");
  }
});

/**
 * Starts the bubble sort visualization with user input
 */
function startBubbleSortVisualization() {
  const input = document.getElementById("numbers").value;

  // 1️⃣ Տողը -> թվերի զանգված
  const array = input
    .split(",")
    .map(num => parseInt(num.trim()))
    .filter(num => !isNaN(num));

  // 2️⃣ Վավերացումներ
  if (array.length === 0) {
    popup(false, "Խնդրում ենք ներմուծել վավեր թվեր:");
    return;
  }

  // ✅ Նոր՝ max ≤ 55 ստուգում
  if (Math.max(...array) > 55) {
    popup(false, "Թվերը չպետք է գերազանցեն 55-ը:");
    return;
  }

  if (array.length > 0) {
    loadBubbleSortVisualization(array);
    popup(true, "Սորտավորումը սկսվում է...");
  } else {
    popup(false, "Խնդրում ենք ներմուծել վավեր թվեր:");
  }
}

/**
 * Loads the visualization: creates bars, runs bubbleSort
 */
async function loadBubbleSortVisualization(array) {
  console.log("Bubble Sort visualization script running...");

  const container = document.getElementById("visualization");
  const startButton = document.getElementById("startSortingButton");

  // Disable the button while sorting
  startButton.disabled = true;
  startButton.textContent = "Սորտավորում ենք...";
  startButton.style.backgroundColor = "#6c757d";

  // Clear previous bars
  container.innerHTML = "";

  // Create bar elements
  let bars = array.map((value) => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${value * 5}px`;
    bar.style.width = "40px";
    bar.style.margin = "3px";
    bar.style.backgroundColor = "#6f42c1";
    bar.style.transition = "height 0.5s, background-color 0.3s ease-in-out";
    bar.style.display = "flex";
    bar.style.alignItems = "flex-end";
    bar.style.justifyContent = "center";
    bar.style.color = "white";
    bar.style.fontSize = "14px";
    bar.style.fontWeight = "bold";
    bar.setAttribute("data-value", value);
    bar.textContent = value;
    bar.style.borderRadius = "5px 5px 0 0"; // Rounded top corners
    bar.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)"; // Add subtle shadow
    container.appendChild(bar);
    return bar;
  });

  // Perform bubble sort animation
  await bubbleSort(bars);

  // Re-enable the button after sorting
  startButton.disabled = false;
  startButton.textContent = "Սկսել սորտավորումը";
  startButton.style.backgroundColor = "#6f42c1";

  // Show completion notification
  popup(true, "Սորտավորումն ավարտված է!");
}

/**
 * The bubble sort animation
 */
async function bubbleSort(bars) {
  let n = bars.length;
  let swapped;

  do {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      bars[i].style.backgroundColor = "#FF5733";
      bars[i + 1].style.backgroundColor = "#FF5733";
      await delay(500);

      let value1 = parseInt(bars[i].getAttribute("data-value"));
      let value2 = parseInt(bars[i + 1].getAttribute("data-value"));

      if (value1 > value2) {
        // Swap heights
        bars[i].style.height = `${value2 * 5}px`;
        bars[i + 1].style.height = `${value1 * 5}px`;

        // Swap data-values
        bars[i].setAttribute("data-value", value2);
        bars[i + 1].setAttribute("data-value", value1);

        // Update displayed text
        bars[i].textContent = value2;
        bars[i + 1].textContent = value1;

        swapped = true;
      }

      bars[i].style.backgroundColor = "#6f42c1";
      bars[i + 1].style.backgroundColor = "#6f42c1";
      await delay(200);
    }
    n--;
  } while (swapped);

  // Final color for sorted bars
  bars.forEach(bar => (bar.style.backgroundColor = "#28a745"));
}

/**
 * Simple delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates container for notifications at bottom right
 */
function createNotificationContainer() {
  // Check if it already exists
  if (document.getElementById("notification-container")) {
    return;
  }

  const container = document.createElement("div");
  container.id = "notification-container";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "1000";
  document.body.appendChild(container);

  // Add CSS animation styles
  if (!document.getElementById("notification-styles")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "notification-styles";
    styleSheet.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

/**
 * Shows a notification in the bottom right
 * @param {boolean} success - Whether this is a success or error notification
 * @param {string} message - The message to display
 */
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

  // Style the notification
  notification.style.backgroundColor = success ? "#4CAF50" : "#f44336"; // Green for success, red for error
  notification.style.color = "white";
  notification.style.padding = "12px 16px";
  notification.style.marginBottom = "10px";
  notification.style.borderRadius = "8px";
  notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  notification.style.minWidth = "250px";
  notification.style.position = "relative";
  notification.style.animation = "popIn 0.3s ease-out";
  notification.style.textAlign = "center";
  notification.style.fontWeight = "bold";

  // Add message
  notification.textContent = message;

  // Add to container
  container.appendChild(notification);

  // Auto remove after exactly 1 second
  setTimeout(() => {
    notification.style.animation = "fadeOut 0.3s";
    setTimeout(() => {
      if (notification.parentNode === container) {
        container.removeChild(notification);
      }
    }, 300);
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("role") !== "Admin") return;

  const main = document.querySelector("main");
  if (!main) return;

  // Only elements inside <main> will be editable
  const editableElements = main.querySelectorAll("p, h1, h2, h3, span, li");

  editableElements.forEach(el => {
    el.setAttribute("contenteditable", "true");
    el.style.outline = "1px dashed #6e43bc";
    el.addEventListener("focus", () => {
      el.style.backgroundColor = "#f3e8ff";
    });
    el.addEventListener("blur", () => {
      el.style.backgroundColor = "";
    });
  });

  console.log("🔧 Admin editing enabled in <main> only.");
});


