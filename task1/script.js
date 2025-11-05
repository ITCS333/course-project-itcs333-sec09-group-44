// Task 1 – Basic Form Validation (Login & Add Student)
// Student: Ajlan Isa Ajlan Ramadhan  ID: 202303872  Group: 44

document.addEventListener("DOMContentLoaded", function () {
  // Login Form Validation
  const loginForm = document.querySelector("form[action='login.php']");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      const email = loginForm.querySelector("input[name='email']").value.trim();
      const password = loginForm.querySelector("input[name='password']").value.trim();

      if (email === "" || password === "") {
        alert("Please enter both email and password.");
        e.preventDefault();
      }
    });
  }

  // Add Student Validation
  const addForm = document.querySelector("form[action='']");
  if (addForm && document.title.includes("Add Student")) {
    addForm.addEventListener("submit", function (e) {
      const name = addForm.querySelector("input[name='name']").value.trim();
      const studentId = addForm.querySelector("input[name='student_id']").value.trim();
      const email = addForm.querySelector("input[name='email']").value.trim();
      const password = addForm.querySelector("input[name='password']").value.trim();

      if (!name || !studentId || !email || !password) {
        alert("Please fill in all fields.");
        e.preventDefault();
      } else if (!email.includes("@")) {
        alert("Please enter a valid email address.");
        e.preventDefault();
      }
    });
  }
});
