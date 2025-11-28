// Element selections
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageContainer = document.getElementById("message-container");

// Show message in box
function displayMessage(message, type) {
  messageContainer.textContent = message;
  messageContainer.className = type; // "success" or "error"
}

// Simple email validation
function isValidEmail(email) {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
}

// Password length check
function isValidPassword(password) {
  return password.length >= 8;
}

// Handle form submit
async function handleLogin(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Client-side validation
  if (!isValidEmail(email)) {
    displayMessage("Invalid email format.", "error");
    return;
  }

  if (!isValidPassword(password)) {
    displayMessage("Password must be at least 8 characters.", "error");
    return;
  }

  try {
    const resp = await fetch("api/index.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await resp.json();

    if (!data.success) {
      displayMessage(data.message || "Invalid email or password.", "error");
      return;
    }

    displayMessage("Login successful!", "success");

    // Redirect based on role
    if (data.user && data.user.role === "admin") {
  window.location.href = "../admin/manage_users.php";
    } else {
      window.location.href = "../../index.html";
    }
  } catch (err) {
    console.error(err);
    displayMessage("Server error. Please try again.", "error");
  }
}

// Set up listener
function setupLoginForm() {
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
}

setupLoginForm();