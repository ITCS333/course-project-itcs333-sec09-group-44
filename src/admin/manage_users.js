// API endpoint (relative to /src/admin/)
const API_URL = "api/index.php";

// Table body
const tableBody = document.getElementById("student-table-body");
const searchInput = document.getElementById("search-input");
const headerCells = document.querySelectorAll("#student-table thead th.sortable");

let currentSortField = "name";
let currentSortOrder = "asc";

// Load students from API
async function loadStudents(searchTerm = "") {
  try {
    let url = `${API_URL}?sort=${encodeURIComponent(currentSortField)}&order=${encodeURIComponent(currentSortOrder)}`;

    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    tableBody.innerHTML = "";

    if (!data.success || !Array.isArray(data.data)) {
      return;
    }

    data.data.forEach(student => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${student.name}</td>
        <td>${student.student_id}</td>
        <td>${student.email}</td>
        <td class="actions">
          <button type="button" onclick="editStudent('${student.student_id}')">Edit</button>
          <button type="button" onclick="deleteStudent('${student.student_id}')">Delete</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("Failed to load students:", err);
  }
}

// Add student
document.getElementById("add-student-form").addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("student-name").value.trim();
  const id = document.getElementById("student-id").value.trim();
  const email = document.getElementById("student-email").value.trim();
  const password = document.getElementById("default-password").value.trim();

  if (!name || !id || !email || !password) {
    alert("Please fill out all fields.");
    return;
  }

  const resp = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: id, name, email, password })
  });

  const data = await resp.json();
  alert(data.message || "Done");

  // Clear inputs
  document.getElementById("student-name").value = "";
  document.getElementById("student-id").value = "";
  document.getElementById("student-email").value = "";

  loadStudents(searchInput.value.trim());
});

// Delete student
async function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;

  const resp = await fetch(`${API_URL}?student_id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });

  const data = await resp.json();
  alert(data.message || "Done");

  loadStudents(searchInput.value.trim());
}

// Edit student (name + email only)
async function editStudent(id) {
  const newName = prompt("Enter new name (leave empty to keep current):");
  const newEmail = prompt("Enter new email (leave empty to keep current):");

  if (!newName && !newEmail) return;

  const payload = { student_id: id };
  if (newName) payload.name = newName;
  if (newEmail) payload.email = newEmail;

  const resp = await fetch(API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await resp.json();
  alert(data.message || "Done");

  loadStudents(searchInput.value.trim());
}

// Change admin password
document.getElementById("password-form").addEventListener("submit", async e => {
  e.preventDefault();

  const current_password = document.getElementById("current-password").value;
  const new_password = document.getElementById("new-password").value;
  const confirm_password = document.getElementById("confirm-password").value;

  if (new_password !== confirm_password) {
    alert("Passwords do not match.");
    return;
  }

  if (new_password.length < 8) {
    alert("New password must be at least 8 characters.");
    return;
  }

  const resp = await fetch("api/admin_password.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      current_password,
      new_password
    })
  });

  const data = await resp.json();
  alert(data.message || "Done");

  document.getElementById("current-password").value = "";
  document.getElementById("new-password").value = "";
  document.getElementById("confirm-password").value = "";
});

// Search as user types
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim();
    loadStudents(term);
  });
}

// Sort when header clicked
headerCells.forEach(th => {
  th.addEventListener("click", () => {
    const field = th.dataset.sort;
    if (!field) return;

    if (currentSortField === field) {
      currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
    } else {
      currentSortField = field;
      currentSortOrder = "asc";
    }

    loadStudents(searchInput.value.trim());
  });
});

// Initial table load
loadStudents();