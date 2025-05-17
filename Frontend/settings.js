/**
 * Backend API URL
 */
const BASE_URL = "https://localhost:7045";

document.addEventListener("DOMContentLoaded", async () => {
  let userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    window.location.href = "login.html";
    return;
  }

  let originalEmail = userEmail;

  // Fetch and populate form fields
  try {
    const response = await fetch(`${BASE_URL}/api/profile/${encodeURIComponent(userEmail)}`);
    if (!response.ok) throw new Error("Could not fetch user data.");
    const userData = await response.json();

    document.getElementById("name").placeholder = userData.username || "";
    document.getElementById("email").placeholder = userData.email || "";
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  // Handle form submission
  const form = document.querySelector(".settings-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedName = document.getElementById("name").value.trim();
    const updatedEmail = document.getElementById("email").value.trim();
    const updatedPassword = document.getElementById("password").value.trim();

    const updatePayload = {
      username: updatedName,
      email: updatedEmail,
      password: updatedPassword
    };


    if (Object.keys(updatePayload).length === 0) {
      alert("Դուք պետք է մուտքագրեք գոնե մեկ փոփոխություն։");
      return;
    }

    try {
      const updateResponse = await fetch(`${BASE_URL}/api/profile/${encodeURIComponent(originalEmail)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatePayload)
      });

      if (!updateResponse.ok) {
        const err = await updateResponse.json();
        throw new Error(err.message || "Failed to update settings.");
      }

      if (updatedEmail && updatedEmail !== originalEmail) {
        localStorage.setItem("userEmail", updatedEmail);
        originalEmail = updatedEmail;
      }

      alert("Հաշվի տվյալները հաջողությամբ թարմացվեցին։");
    } catch (error) {
      console.error("Update error:", error);
      alert(error.message || "Չհաջողվեց թարմացնել հաշվի տվյալները։");
    }
  });

  // Logout functionality
  const logoutLink = document.getElementById("logout");
  logoutLink?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("userEmail");
    window.location.href = "login.html";
  });

  // Delete account functionality
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  deleteAccountBtn?.addEventListener("click", async () => {
    const confirmed = confirm("Վստահ եք, որ ցանկանում եք ջնջել ձեր հաշիվը? Այս գործողությունը անվերադարձ է։");
    if (!confirmed) return;

    try {
      const response = await fetch(`${BASE_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: originalEmail })
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Հաշիվը հաջողությամբ ջնջվեց։");
        localStorage.removeItem("userEmail");
        window.location.href = "login.html";
      } else {
        alert(result.message || "Հաշիվը ջնջելու ընթացքում խնդիր առաջացավ։");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      alert("Սխալ տեղի ունեցավ հաշիվը ջնջելու ընթացքում։");
    }
  });
});

// Back button
document.addEventListener("DOMContentLoaded", function () {
  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.disabled = false;
    backButton.addEventListener("click", function () {
      window.history.back();
    });
  }
});

