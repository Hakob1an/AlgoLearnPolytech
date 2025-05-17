/**
 * Backend API URL
 */
const BASE_URL = "https://localhost:7045";

/**
 * This code is responsible for:
 * 1. Checking if elements exist before running any code,
 * 2. Loading stored email from localStorage,
 * 3. Enabling the button only when a 6-digit code is entered,
 * 4. Handling the event for verification request.
 */
document.addEventListener("DOMContentLoaded", function () {
  const verifyButton = document.getElementById("verify-button");
  const emailInput = document.getElementById("verification-email");
  const codeInput = document.getElementById("verification-code");

  console.log("✅ Script Loaded");

  if (!verifyButton) {
    console.error("❌ [ERROR] Verify button not found in the DOM!");
    return;
  }

  if (!emailInput || !codeInput) {
    console.error("❌ [ERROR] Email input or verification code input not found!");
    return;
  }

  const storedEmail = localStorage.getItem("userEmail");
  if (storedEmail) {
    emailInput.value = storedEmail;
  } else {
    console.warn("⚠️ [WARNING] No stored email found. User must enter it manually.");
  }

  codeInput.addEventListener("input", function () {
    let code = codeInput.value.trim();
    console.log("User Entered:", code, "| Length:", code.length);

    if (code.length === 6 && /^\d{6}$/.test(code)) {
      verifyButton.disabled = false;
      verifyButton.classList.add("enabled");
      verifyButton.style.pointerEvents = "auto";
      verifyButton.style.cursor = "pointer";
      verifyButton.style.backgroundColor = "#007bff";
      console.log("✅ Button Enabled & Clickable");
  } else {
      verifyButton.disabled = true;
      verifyButton.classList.remove("enabled"); 
      verifyButton.style.pointerEvents = "none";
      verifyButton.style.cursor = "not-allowed";
      verifyButton.style.backgroundColor = "gray";
      console.log("❌ Button Disabled");
  }
  });

  verifyButton.addEventListener("click", async function () {
    const email = emailInput.value.trim();
    const code = codeInput.value.trim();

    if (!email || !code) {
      displayError("Please enter your email and verification code.");
      return;
    }

    console.log(`🔎 [DEBUG] Sending verification request:`, { email, code });

    try {
      verifyButton.disabled = true; 
      const response = await fetch(`${BASE_URL}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();
      console.log("🔎 [DEBUG] Server response:", result);

      if (response.ok) {
        displaySuccess("✅ Email verified successfully!");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        displayError(result.message || "❌ Invalid verification code.");
        verifyButton.disabled = false;
      }
    } catch (error) {
      console.error("❌ [ERROR] Verification request failed:", error);
      displayError("An error occurred during verification. Please try again later.");
      verifyButton.disabled = false; 
    }
  });
});

/**
 * Method to show error messages.
 * @param {string} message 
 */
function displayError(message) {
  const errorContainer = document.querySelector(".error-container");
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
  } else {
    alert(message);
  }
}

function displaySuccess(message) {
  alert(message);
}
