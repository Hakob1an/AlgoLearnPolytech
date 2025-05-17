/**
     * Backend API base URL.
     */
const BASE_URL = "https://localhost:7045";

/**
 * This method is responsible for:
 * 1. fetching the dashboard data,
 * 2. showing the right UI for new and old users.
 */
async function loadDashboard() {
  try {
    document.getElementById("loading").style.display = "block";

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      console.warn("No user email found. Redirecting to login...");
      window.location.href = "login.html";
      return;
    }

    console.log("Fetching dashboard data for email:", userEmail);

    const response = await fetch(`${BASE_URL}/api/dashboard/${encodeURIComponent(userEmail)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    document.getElementById("loading").style.display = "none";

    if (!response.ok) {
      console.error("Failed to fetch dashboard data:", await response.text());
      showNewUserUI("User");
      return;
    }

    const data = await response.json();
    console.log("Dashboard data received:", data);

    if ((data.progress && data.progress > 0) || (data.lastViewedItem && data.lastViewedItem.trim() !== "")) {
      showReturningUserUI(data);
    } else {
      showNewUserUI(data.username || "New User");
    }

  } catch (error) {
    document.getElementById("loading").style.display = "none";
    console.error("Error loading dashboard:", error);
    showNewUserUI("User");
  }
}

function showNewUserUI(username) {
  document.getElementById("progress-section").style.display = "none";
  document.getElementById("lastViewedItemContainer").style.display = "none";
  document.getElementById("suggestions-section").style.display = "none";

  const friendlyMessage = document.getElementById("friendly-message");
  const friendlyTitle = document.getElementById("friendly-title");
  const friendlyText = document.getElementById("friendly-text");

  friendlyTitle.textContent = `Բարի գալուստ AlgoLearn, ${username}!`;
  friendlyText.textContent = "Թվում է, թե Դուք նոր եք սկսում։ Ուսումնասիրեք մեր ուսուցման բաժինները՝ ձեր ճանապարհորդությունը սկսելու համար։";
  friendlyMessage.style.display = "block";
}

/**
 * Method for showing UI for old users. It displays: 
 * 1. progress, 
 * 2. suggestions,
 * 3. last viewed item.
 * 
 * @param {Promise<any>} data 
 */
function showReturningUserUI(data) {
  document.getElementById("friendly-message").style.display = "none";

  document.getElementById("welcome-message").textContent =
    `Բարի վերադարձ, ${data.username || "User"}!`;
  document.getElementById("welcome-message").style.display = "block";

  if (typeof data.progress === "number" && data.progress >= 0) {
    document.getElementById("progress-section").style.display = "block";
    document.getElementById("progress-fill").style.width = `${data.progress}%`;
    document.getElementById("progress-text").textContent = `${data.progress}%-ը ուսումնասիրված է`;
  }

  const userEmail = localStorage.getItem("userEmail");
  fetchProblemSuggestions(userEmail);

  const topicDisplayNames = {
    BubbleSort: "Պղպջակային սորտավորում",
    QuickSort: "Արագ սորտավորում",
    InsertionSort: "Տեղադրմամբ սորտավորում",
    Dijkstra: "Դեյկստրայի ալգորիթմ",

    LinkedList: "Կապակցված ցուցակ",
    Stack: "Ստեկ",
    BinarySearchTree: "Երկուական որոնման ծառ"
  };

  if (data.lastViewedItem) {
    const itemName = data.lastViewedItem.trim();

    const algorithmTopics = [
      "BubbleSort", "QuickSort", "InsertionSort", "Dijkstra"
    ];

    const dataStructureTopics = [
      "LinkedList", "Stack", "BinarySearchTree"
    ];

    let categoryFolder = "";
    if (algorithmTopics.includes(itemName)) {
      categoryFolder = "Algorithms";
    } else if (dataStructureTopics.includes(itemName)) {
      categoryFolder = "DataStructures";
    } else {
      console.warn("❌ Unknown item:", itemName);
      return;
    }

    const fileName = itemName.toLowerCase() + ".html";
    const targetPage = `${categoryFolder}/${itemName}/${fileName}`;
    const displayName = topicDisplayNames[itemName] || itemName;

    const linkEl = document.getElementById("lastViewedItemLink");
    const container = document.getElementById("lastViewedItemContainer");

    linkEl.textContent = `Շարունակել ուսուցումը: ${displayName}`;
    linkEl.href = targetPage;
    linkEl.style.display = "inline-block";
    container.style.display = "block";

    // Add a description with the topic name
    document.getElementById("last-viewed-description").textContent =
      `Դուք վերջին անգամ աշխատել եք "${displayName}" թեմայի վրա։ Շարունակե՞լ։`;

    console.log("✅ Last viewed link set to:", targetPage);
  }
}

/**
 * Fetches the user's solved problems to check against suggestions
 * @param {string} userEmail 
 * @returns {Promise<Array>} Array of solved problem names
 */
async function fetchSolvedProblems(userEmail) {
  try {
    const response = await fetch(`${BASE_URL}/api/profile/${encodeURIComponent(userEmail)}`);
    if (!response.ok) {
      console.warn("Unable to fetch solved problems");
      return [];
    }
    
    const userData = await response.json();
    
    // Extract problem names from the solved problems array
    if (userData.solvedProblems && Array.isArray(userData.solvedProblems)) {
      return userData.solvedProblems.map(problem => {
        // Try to get the name from different possible fields
        return problem.problemName || problem.name || problem.title || "";
      }).filter(name => name); // Remove any empty names
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching solved problems:", error);
    return [];
  }
}

/**
 * Marks a problem as solved
 * @param {string} userEmail The user's email
 * @param {string} problemName The problem name
 * @param {boolean} isSolved Whether the problem is solved
 */
async function markProblemAsSolved(userEmail, problemName, isSolved) {
  try {
    // Based on the server API code, we need to use the problem name in the URL
    const endpoint = isSolved 
      ? `${BASE_URL}/api/problems/${encodeURIComponent(problemName)}/solve` 
      : `${BASE_URL}/api/problems/${encodeURIComponent(problemName)}/unsolve`;
    
    console.log(`Marking problem "${problemName}" as ${isSolved ? 'solved' : 'unsolved'}`);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userEmail: userEmail,
        problemName: problemName // Include the problemName in the request body
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to mark problem: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`Server response:`, result);
    
    // Update the list item appearance
    const checkbox = document.querySelector(`input[data-problem-name="${problemName}"]`);
    if (checkbox) {
      // Update the list item appearance
      const listItem = checkbox.closest('li');
      if (listItem) {
        if (isSolved) {
          listItem.classList.add('solved');
        } else {
          listItem.classList.remove('solved');
        }
      }
    }
    
    // Refresh progress after marking a problem as solved
    setTimeout(() => {
      refreshProgress(userEmail);
    }, 500);
    
  } catch (error) {
    console.error(`Error ${isSolved ? 'marking' : 'unmarking'} problem as solved:`, error);
    // Revert checkbox state if there was an error
    const checkbox = document.querySelector(`input[data-problem-name="${problemName}"]`);
    if (checkbox) {
      checkbox.checked = !isSolved;
    }
  }
}

/**
 * Refreshes the progress bar after marking problems as solved
 * @param {string} userEmail The user's email
 */
async function refreshProgress(userEmail) {
  try {
    const response = await fetch(`${BASE_URL}/api/dashboard/${encodeURIComponent(userEmail)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      console.warn("Unable to refresh progress");
      return;
    }
    
    const data = await response.json();
    
    if (typeof data.progress === "number" && data.progress >= 0) {
      document.getElementById("progress-fill").style.width = `${data.progress}%`;
      document.getElementById("progress-text").textContent = `${data.progress}%-ը ուսումնասիրված է`;
    }
  } catch (error) {
    console.error("Error refreshing progress:", error);
  }
}

/**
 * A method to fetch problem suggestions according to users progress.
 * Shows problems with correctly colored difficulty indicators based on Armenian difficulty values.
 * @param {string} userEmail 
 */
async function fetchProblemSuggestions(userEmail) {
  try {
    // First, fetch the user's solved problems to check against suggestions
    const solvedProblemNames = await fetchSolvedProblems(userEmail);
    console.log("Solved problem names:", solvedProblemNames);
    
    const response = await fetch(`${BASE_URL}/api/dashboard/suggestions/${encodeURIComponent(userEmail)}`);
    if (!response.ok) {
      throw new Error(`❌ Failed to fetch suggestions: ${response.status}`);
    }

    const suggestions = await response.json();
    console.log("Problem suggestions received:", suggestions);

    const suggestionsContainer = document.getElementById("suggestions-list");
    const suggestionsSection = document.getElementById("suggestions-section");

    if (!suggestionsContainer || !suggestionsSection) {
      console.error("❌ Missing elements in dashboard.html: #suggestions-list or #suggestions-section");
      return;
    }

    suggestionsContainer.innerHTML = "";

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      suggestionsSection.style.display = "block";

      // All available problem icons
      const problemIcons = {
        "sorting": "&#128200;", // 📈
        "array": "&#128202;",   // 📊
        "graph": "&#128309;",   // 🔵
        "tree": "&#127794;",    // 🌲
        "number": "&#128290;",  // 🔢
        "string": "&#128172;",  // 💬
        "default": "&#128221;"  // 📝
      };
      
      // Get all icon types for random selection
      const iconTypes = Object.keys(problemIcons);

      // FIX: Armenian difficulty mapping - trim whitespace and ensure case-insensitive comparison
      const difficultyClassMap = {
        "հեշտ": "easy",
        "միջին": "medium",
        "բարդ": "hard"
      };

      // Difficulty tooltips and descriptive text in Armenian
      const difficultyInfo = {
        "easy": {
          tooltip: "Սկսնակների համար",
          description: "Հեշտ"
        },
        "medium": {
          tooltip: "Միջին բարդության",
          description: "Միջին"
        },
        "hard": {
          tooltip: "Փորձառուների համար",
          description: "Բարդ"
        },
        // Default fallback for any unexpected difficulty value
        "default": {
          tooltip: "Խնդիր",
          description: "Խնդիր"
        }
      };

      suggestions.forEach(problem => {
        const listItem = document.createElement("li");
        
        // Get the problem name (which we need for the API)
        const problemName = problem.problemName || problem.name || "Խնդիր";
        
        if (!problemName || problemName === "Խնդիր") {
          console.warn("Problem missing name:", problem);
          return; // Skip this problem if no name is found
        }
        
        // Check if this problem is already solved
        const isProblemSolved = solvedProblemNames.includes(problemName);
        if (isProblemSolved) {
          listItem.classList.add('solved');
        }
        
        // Create checkbox for marking problem as solved
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "problem-solved-checkbox";
        checkbox.checked = isProblemSolved;
        checkbox.setAttribute("data-problem-name", problemName);
        checkbox.setAttribute("aria-label", "Նշել լուծված");
        
        // Add success checkmark icon (only shown when solved)
        const successIcon = document.createElement("div");
        successIcon.className = "success-checkmark";
        successIcon.innerHTML = "✓";
        
        // Add event listener to checkbox
        checkbox.addEventListener('change', async (e) => {
          // Prevent the click from navigating to the problem page
          e.stopPropagation();
          
          // Get the problem name from the data attribute
          const problemName = checkbox.getAttribute("data-problem-name");
          const isSolved = checkbox.checked;
          
          console.log(`Checkbox changed for problem "${problemName}": ${isSolved}`);
          
          // Call the function to mark the problem as solved/unsolved
          await markProblemAsSolved(userEmail, problemName, isSolved);
        });
        
        const link = document.createElement("a");

        // Choose a random icon type
        const randomIconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];
        
        // Icon element with random icon
        const icon = document.createElement("span");
        icon.className = "suggestion-icon";
        icon.innerHTML = problemIcons[randomIconType];

        // Problem Name
        const textSpan = document.createElement("span");
        textSpan.textContent = problemName;
        textSpan.className = "problem-name"; // Add class for styling the strikethrough effect

        // Difficulty Label - Fixed version
        const difficultySpan = document.createElement("span");
        
        // Get the Armenian difficulty string from the API and normalize it
        const rawDifficulty = problem.problemDifficulty || problem.difficulty || "";
        const normalizedDifficulty = rawDifficulty.trim().toLowerCase();
        
        console.log("Original difficulty:", rawDifficulty);
        console.log("Normalized difficulty:", normalizedDifficulty);
        
        // FIX: Improved mapping logic that handles variations better
        let difficultyClass = "easy"; // Default to easy
        
        // Check if the normalized difficulty contains any of our known terms
        if (normalizedDifficulty.includes("հեշտ")) {
          difficultyClass = "easy";
        } else if (normalizedDifficulty.includes("միջին")) {
          difficultyClass = "medium";
        } else if (normalizedDifficulty.includes("բարդ")) {
          difficultyClass = "hard";
        }
        
        console.log("Assigned class:", difficultyClass);
        
        difficultySpan.className = `difficulty ${difficultyClass}`;
        
        // Use the original Armenian text from the API
        difficultySpan.textContent = rawDifficulty || difficultyInfo[difficultyClass].description;
        
        // Add tooltip data based on the difficulty class
        const tooltipInfo = difficultyInfo[difficultyClass] || difficultyInfo.default;
        difficultySpan.setAttribute("data-tooltip", tooltipInfo.tooltip);

        // Final Link Composition
        link.href = problem.problemLink || "#";
        link.target = "_blank";
        link.appendChild(icon);
        link.appendChild(textSpan);
        link.appendChild(difficultySpan);

        // Make sure click on checkbox doesn't trigger link navigation
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        // Add the checkbox, then the link (no success checkmark)
        listItem.appendChild(checkbox);
        listItem.appendChild(link);
        suggestionsContainer.appendChild(listItem);
      });
    } else {
      suggestionsSection.style.display = "none";
      console.warn("No array of suggestions returned:", suggestions);
    }
  } catch (error) {
    console.error("❌ Error fetching problem suggestions:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadDashboard);

const logoutButton = document.getElementById("logout");
if (logoutButton) {
  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("userEmail");
    window.location.href = "home.html";
  });
}

const homeButton = document.getElementById("home");
if (homeButton) {
  homeButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "dashboard.html";
  });
}