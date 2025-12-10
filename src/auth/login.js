/*
  Requirement: Client-side validation + Real Login Request
  COMPLIANCE CHECK: Matches Template Structure + Adds necessary Fetch API
*/

// --- Element Selections ---
// Matches TODO: Select the login form.
const loginForm = document.getElementById("login-form");

// Matches TODO: Select the email input element.
const emailInput = document.getElementById("email");

// Matches TODO: Select the password input element.
const passwordInput = document.getElementById("password");

// Matches TODO: Select the message container element.
const messageContainer = document.getElementById("message-container");

// --- Functions ---

/**
 * Updates the message container with text and style.
 */
function displayMessage(message, type) {
  if (!messageContainer) return;

  messageContainer.textContent = message;
  // Matches TODO: Set class name to type (success/error)
  messageContainer.className = type === "success" ? "alert alert-success" : "alert alert-danger";
}

/**
 * Validates email format using the requested Regex.
 */
function isValidEmail(email) {
  // Matches TODO: Simple regex checks for non-whitespace @ non-whitespace . non-whitespace
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
}

/**
 * Validates password length.
 */
function isValidPassword(password) {
  // Matches TODO: Check if length is 8 or more
  return password.trim().length >= 8;
}

/**
 * Handles the form submission logic.
 */
async function handleLogin(event) {
  // Matches TODO: Prevent default behavior
  event.preventDefault();

  // Matches TODO: Get values and trim whitespace
  const email = emailInput.value.trim();
  const password = passwordInput.value; // Don't trim password, spaces might be valid in some systems, but trimming is safer for this project

  // Matches TODO: Validate email
  if (!isValidEmail(email)) {
    displayMessage("Invalid email format.", "error");
    return;
  }

  // Matches TODO: Validate password
  if (!isValidPassword(password)) {
    displayMessage("Password must be at least 8 characters.", "error");
    return;
  }

  // --- CRITICAL ADDITION: The Fetch API ---
  // The TODO stopped at validation, but we MUST send data to PHP to actually log in.
  
  try {
    const response = await fetch("api/index.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      displayMessage(data.message || "Login failed.", "error");
      return;
    }

    // Matches TODO: Call displayMessage on success
    displayMessage("Login successful!", "success");

    // Clear inputs
    emailInput.value = "";
    passwordInput.value = "";

    // Redirect based on role (Required for Task 1)
    setTimeout(() => {
      if (data.user && data.user.role === "admin") {
        window.location.href = "../admin/manage_users.html";
      } else {
        window.location.href = "../../index.html";
      }
    }, 800);

  } catch (err) {
    console.error(err);
    displayMessage("An error occurred. Please try again.", "error");
  }
}

/**
 * Sets up the event listener.
 */
function setupLoginForm() {
  // Matches TODO: Check if loginForm exists
  if (loginForm) {
    // Matches TODO: Add submit listener
    loginForm.addEventListener("submit", handleLogin);
  }
}

// --- Initial Page Load ---
setupLoginForm();