/*
  Admin portal interactivity (Task 1) - FINAL VERSION
  Features: Real ID extraction, Real Edit (PUT), Real Password Change
*/

// --- Global Data Store ---
let students = [];

// --- Element Selections ---
const studentTableBody = document.querySelector("#student-table tbody");
const addStudentForm = document.getElementById("add-student-form");
// Ensure your HTML form has id="password-form"
const changePasswordForm = document.getElementById("password-form"); 
const searchInput = document.getElementById("search-input");
const defaultPasswordInput = document.getElementById("default-password");

// --- Functions ---

/**
 * Helper: Extract ID from email (e.g., "202101234@stu..." -> "202101234")
 */
function extractStudentId(email) {
    if (!email || !email.includes('@')) return "N/A";
    return email.split('@')[0];
}

/**
 * Build one <tr> for a student.
 */
function createStudentRow(student) {
  const tr = document.createElement("tr");

  const nameTd = document.createElement("td");
  nameTd.textContent = student.name;

  // FIX: Display University ID (from email) instead of Database ID
  const idTd = document.createElement("td");
  idTd.textContent = extractStudentId(student.email); 

  const emailTd = document.createElement("td");
  emailTd.textContent = student.email;

  const actionsTd = document.createElement("td");

  // Edit Button
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  editBtn.className = "btn btn-sm btn-outline-primary me-2 edit-btn";
  editBtn.dataset.id = student.id; // Keep DB ID hidden for logic

  // Delete Button
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "btn btn-sm btn-outline-danger delete-btn";
  deleteBtn.dataset.id = student.id;

  actionsTd.appendChild(editBtn);
  actionsTd.appendChild(deleteBtn);

  tr.appendChild(nameTd);
  tr.appendChild(idTd);
  tr.appendChild(emailTd);
  tr.appendChild(actionsTd);

  return tr;
}

/**
 * Render all students
 */
function renderTable(studentArray) {
  studentTableBody.innerHTML = "";
  if (!studentArray || studentArray.length === 0) {
    studentTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No students found.</td></tr>`;
    return;
  }
  studentArray.forEach(student => studentTableBody.appendChild(createStudentRow(student)));
}

/**
 * Add student handler
 */
async function handleAddStudent(event) {
  event.preventDefault();
  const name = document.getElementById("student-name").value.trim();
  const email = document.getElementById("student-email").value.trim();
  const password = defaultPasswordInput ? defaultPasswordInput.value : "password";

  if (!name || !email) { alert("Fill all fields"); return; }

  try {
    const res = await fetch("api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });
    const result = await res.json();
    if (result.success) {
        alert("Student Added!");
        loadStudentsAndInitialize();
        document.getElementById("student-name").value = "";
        document.getElementById("student-email").value = "";
    } else {
        alert(result.message);
    }
  } catch (err) { console.error(err); }
}

/**
 * Password Change Handler
 */
async function handleChangePassword(event) {
    event.preventDefault();
    
    // Get values
    const currentPass = document.getElementById("current-password").value;
    const newPass = document.getElementById("new-password").value;
    const confirmPass = document.getElementById("confirm-password").value;

    if (newPass !== confirmPass) {
        alert("New passwords do not match.");
        return;
    }
    if (newPass.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }

    // Send to PHP
    try {
        const res = await fetch("api/index.php", {
            method: "POST", // Using POST for this action
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                action: "change_password", // Important Flag
                current_password: currentPass, 
                new_password: newPass 
            })
        });
        const result = await res.json();
        
        if (result.success) {
            alert("Password changed successfully!");
            document.getElementById("current-password").value = "";
            document.getElementById("new-password").value = "";
            document.getElementById("confirm-password").value = "";
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error("Password change error", err);
        alert("Failed to change password.");
    }
}

/**
 * Table Click Handler (Delete & Edit)
 */
async function handleTableClick(event) {
  const target = event.target;
  const id = target.dataset.id; // Database ID

  // --- DELETE ---
  if (target.classList.contains("delete-btn")) {
    if (!confirm("Delete this student?")) return;
    try {
        const res = await fetch(`api/index.php?id=${id}`, { method: "DELETE" });
        const result = await res.json();
        if(result.success) loadStudentsAndInitialize();
        else alert(result.message);
    } catch(err) { console.error(err); }
  }

  // --- EDIT (PUT Request) ---
  if (target.classList.contains("edit-btn")) {
    const student = students.find(s => String(s.id) === String(id));
    if (!student) return;

    const newName = prompt("Edit name:", student.name);
    if (newName === null) return; // Cancelled

    const newEmail = prompt("Edit email:", student.email);
    if (newEmail === null) return; // Cancelled

    // Send PUT Request
    try {
        const res = await fetch("api/index.php", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id: id, 
                name: newName, 
                email: newEmail 
            })
        });
        const result = await res.json();

        if (result.success) {
            alert("Student updated!");
            loadStudentsAndInitialize();
        } else {
            alert("Update failed: " + result.message);
        }
    } catch(err) {
        console.error(err);
        alert("Error updating student.");
    }
  }
}

/**
 * Search Handler
 */
function handleSearch(event) {
  const term = event.target.value.toLowerCase().trim();
  if (!term) {
    renderTable(students);
    return;
  }
  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(term) || 
    s.email.toLowerCase().includes(term)
  );
  renderTable(filtered);
}

/**
 * Load Data
 */
async function loadStudentsAndInitialize() {
  try {
    const res = await fetch("api/index.php");
    if (res.ok) {
      const result = await res.json();
      students = result.success ? result.data : [];
    }
  } catch (err) { console.error(err); }
  renderTable(students);
}
// --- LOGOUT LOGIC ---
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault(); // Good practice to prevent any default link behavior
        
        try {
            // 1. Tell the backend to destroy the PHP session
            // Note: We go up one level (..) to 'auth', then into 'api'
            await fetch("../auth/api/logout.php"); 
            
            // 2. Redirect the user to the login page
            window.location.href = "../auth/login.html"; 
            
        } catch (err) {
            console.error("Logout failed", err);
            // Fallback: Redirect anyway if the fetch fails
            window.location.href = "../auth/login.html"; 
        }
    });
}

// Attach Listeners
if (addStudentForm) addStudentForm.addEventListener("submit", handleAddStudent);
if (changePasswordForm) changePasswordForm.addEventListener("submit", handleChangePassword);
if (studentTableBody) studentTableBody.addEventListener("click", handleTableClick);
if (searchInput) searchInput.addEventListener("input", handleSearch);

// Start
loadStudentsAndInitialize();