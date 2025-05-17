/**
 * This part is responsible for:
 * 1. checking if user is logged in. If not, it redirects to login,
 * 2. fetching profile data
 */
document.addEventListener("DOMContentLoaded", async () => {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userData = await fetchProfileData(userEmail);
    renderProfile(userData);
  } catch (error) {
    console.error("Error fetching profile data:", error);
    renderErrorMessage("Could not load your profile. Please <a href='login.html'>log in</a> again.");
  }

  const logoutLink = document.getElementById("logout");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("userEmail");
      window.location.href = "login.html";
    });
  }
});

/**
 * Fetches the profile data from the backend API.
 * @param {string} email - The email of the user to fetch the profile for.
 * @returns {Promise<Object>} - The user's profile data.
 */
async function fetchProfileData(email) {
  const response = await fetch(`https://localhost:7045/api/profile/${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch profile data. Status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Renders the user's profile data on the page.
 * @param {Object} userData - The user's profile data.
 */
function renderProfile(userData) {
  const container = document.getElementById("profile-container");
  container.innerHTML = `
    <!-- User Information Section -->
    <section class="user-info">
      <h1>${userData.username || "Անհայտ օգտատեր"}</h1>
      <p>Էլ. փոստ: ${userData.email || "Հասանելի չէ"}</p>
      <p>Գրանցված է սկսած: ${formatDate(userData.createdAt)}</p>
    </section>

    <!-- Achievements Section -->
    <section class="achievements">
      <h2>Նվաճումներ</h2>
      <div class="achievement-list">
        ${
          userData.achievements && userData.achievements.length > 0
            ? userData.achievements
                .map(
                  (a) => `
                  <div class="achievement">
                    <span class="badge">🏆</span>
                    <p>${a.name}</p>
                  </div>
                `
                )
                .join("")
            : "<p>Նվաճումներ դեռ չկան.</p>"
        }
      </div>
    </section>

    <!-- Progress Section -->
    <section class="progress">
      <h2>Ուսուցման Առաջընթաց</h2>
      <div class="progress-bar-container">
        <label for="progress">Ընդհանուր առաջընթացը:</label>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${userData.progress || 0}%;"></div>
        </div>
        <p>${userData.progress || 0}% Կատարված է</p>
      </div>
    </section>

    <!-- Settings Section -->
    <section class="settings-link">
      <a href="settings.html" class="option">	Անցնել կարգավորումների էջ</a>
    </section>
  `;
}

/**
 * Displays an error message on the page.
 * @param {string} message - The error message to display.
 */
function renderErrorMessage(message) {
  const container = document.getElementById("profile-container");
  container.innerHTML = `<p>${message}</p>`;
}

/**
 * Formats a date string into a user-friendly format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - A formatted date or a fallback.
 */
function formatDate(dateString) {
  return dateString ? new Date(dateString).toLocaleDateString() : "Unknown Date";
}
