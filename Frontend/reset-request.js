// Main base URL for API requests
const BASE_URL = "https://localhost:7045";

document.addEventListener("DOMContentLoaded", () => {
  // Get all step containers
  const stepRequest = document.getElementById("step-request");
  const stepVerify = document.getElementById("step-verify");
  const stepReset = document.getElementById("step-reset");

  // Step 1: Request code elements
  const emailInput = document.getElementById("reset-email");
  const sendBtn = document.getElementById("send-code");
  const errorRequest = document.getElementById("error-request");
  const successRequest = document.getElementById("success-request");

  // Step 2: Verify code elements
  const codeInput = document.getElementById("verification-code");
  const verifyBtn = document.getElementById("verify-code-btn");
  const errorVerify = document.getElementById("error-verify");
  const successVerify = document.getElementById("success-verify");

  // Step 3: Reset password elements
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const resetBtn = document.getElementById("reset-password-btn");
  const errorReset = document.getElementById("error-reset");
  const successReset = document.getElementById("success-reset");

  // Password visibility toggle elements
  const toggleNewPassword = document.getElementById("toggle-new-password");
  const toggleConfirmPassword = document.getElementById("toggle-confirm-password");

  // Handle password visibility toggle
  if (toggleNewPassword) {
    toggleNewPassword.addEventListener("click", () => {
      togglePasswordVisibility(newPasswordInput, toggleNewPassword);
    });
  }

  if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener("click", () => {
      togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
    });
  }

  // Function to toggle password visibility
  function togglePasswordVisibility(inputElement, toggleButton) {
    const type = inputElement.getAttribute("type") === "password" ? "text" : "password";
    inputElement.setAttribute("type", type);
    
    // Toggle eye icons
    const eyeIcon = toggleButton.querySelector(".eye-icon");
    const eyeOffIcon = toggleButton.querySelector(".eye-off-icon");
    
    if (type === "password") {
      eyeIcon.style.display = "block";
      eyeOffIcon.style.display = "none";
    } else {
      eyeIcon.style.display = "none";
      eyeOffIcon.style.display = "block";
    }
  }

  // STEP 1: Request Code Logic
  // Enable "Send Code" button only when a valid email is entered
  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim();
    // Basic email validation using regex
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    sendBtn.disabled = !isValid;
  });

  // Send code functionality
  sendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) {
      showError(errorRequest, "Մուտքագրեք էլ․ փոստը։");
      return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = "Ուղարկվում է...";

    try {
      const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        // Store email for future steps
        localStorage.setItem("resetEmail", email);
        showSuccess(successRequest, "✅ Կոդը ուղարկվել է։");
        
        // Transition to step 2 after a short delay
        setTimeout(() => {
          stepRequest.style.display = "none";
          stepVerify.style.display = "block";
        }, 1500);
      } else {
        showError(errorRequest, result.message || "Չհաջողվեց ուղարկել կոդը։");
        sendBtn.disabled = false;
        sendBtn.textContent = "Ուղարկել հաստատման կոդը";
      }
    } catch (err) {
      console.error(err);
      showError(errorRequest, "Սերվերի սխալ։");
      sendBtn.disabled = false;
      sendBtn.textContent = "Ուղարկել հաստատման կոդը";
    }
  });

  // STEP 2: Verify Code Logic
  // Enable verify button only for valid code
  codeInput.addEventListener("input", () => {
    const code = codeInput.value.trim();
    verifyBtn.disabled = !(code.length === 6 && /^\d{6}$/.test(code));
  });

  // Verify code functionality
  verifyBtn.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    const email = localStorage.getItem("resetEmail");
    
    if (!code || code.length !== 6) {
      showError(errorVerify, "Մուտքագրեք վավեր 6-նիշանոց կոդը։");
      return;
    }

    verifyBtn.disabled = true;
    verifyBtn.textContent = "Հաստատվում է...";

    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });

      const result = await response.json();

      if (response.ok) {
        // Store verification token or code if needed
        if (result.token) {
          localStorage.setItem("resetToken", result.token);
        }
        
        showSuccess(successVerify, "✅ Կոդը հաստատված է։");
        
        // Transition to step 3 after a short delay
        setTimeout(() => {
          stepVerify.style.display = "none";
          stepReset.style.display = "block";
        }, 1500);
      } else {
        showError(errorVerify, result.message || "Սխալ կամ ժամկետանց կոդ։");
        verifyBtn.disabled = false;
        verifyBtn.textContent = "Հաստատել կոդը";
      }
    } catch (err) {
      console.error(err);
      showError(errorVerify, "Սերվերի սխալ։");
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Հաստատել կոդը";
    }
  });

  // STEP 3: Reset Password Logic
  // Enable reset button only when both password fields are filled and match
  function validatePasswords() {
    const newPass = newPasswordInput.value;
    const confirmPass = confirmPasswordInput.value;
    
    const isValid = newPass.length >= 6 && newPass === confirmPass;
    resetBtn.disabled = !isValid;
    return isValid;
  }

  newPasswordInput.addEventListener("input", validatePasswords);
  confirmPasswordInput.addEventListener("input", validatePasswords);

  // Reset password functionality
  resetBtn.addEventListener("click", async () => {
    if (!validatePasswords()) {
      showError(errorReset, "Գաղտնաբառերը չեն համապատասխանում կամ չափազանց կարճ են։");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    const code = localStorage.getItem("resetToken") || codeInput.value.trim();
    const newPassword = newPasswordInput.value;

    resetBtn.disabled = true;
    resetBtn.textContent = "Վերականգնվում է...";

    try {
      const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword })
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess(successReset, "✅ Գաղտնաբառը հաջողությամբ փոխվել է։");
        
        // Clean up localStorage
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetToken");
        
        // Redirect to login page after a delay
        setTimeout(() => {
          window.location.href = "login.html";
        }, 3000);
      } else {
        showError(errorReset, result.message || "Չհաջողվեց փոխել գաղտնաբառը։");
        resetBtn.disabled = false;
        resetBtn.textContent = "Վերականգնել գաղտնաբառը";
      }
    } catch (err) {
      console.error(err);
      showError(errorReset, "Սերվերի սխալ։");
      resetBtn.disabled = false;
      resetBtn.textContent = "Վերականգնել գաղտնաբառը";
    }
  });
});

// Utility functions for showing error and success messages
function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
  
  // Hide the message after 5 seconds
  setTimeout(() => {
    element.style.display = "none";
  }, 5000);
}

function showSuccess(element, message) {
  element.textContent = message;
  element.style.display = "block";
  
  // Hide the message after 5 seconds
  setTimeout(() => {
    element.style.display = "none";
  }, 5000);
}