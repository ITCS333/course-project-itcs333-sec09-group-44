# ITCS333 – Internet Software Development

## Course Project (2025/2026 – First Semester)

### 🧩 Group 44 – Section 09

This repository contains the group project for **ITCS333: Internet Software Development** at the **University of Bahrain**.  
The project implements a simple course website with separate areas for **admin** (instructor) and **students**.

---

## 👥 Group Members & Tasks

| Task | Name | Student ID | Status |
|------|------|------------|--------|
| 1 – Admin Portal & User Management | **Ajlan Isa Ajlan Ramadhan** | **202303872** | ✅ Completed |
| 2 – Course Resources | *Hussain Yasser Ali* | *202304049* | 🔜 In progress |
| 3 – Weekly Breakdown | *Khalid Abdulla* | *202306240* | 🔜 In progress |
| 4 – Assignments | *Isa Nader Omran* | *202303812* |  |  Completed |
| 5 – Discussion Board | *n* | ** | 🔜 In progress |

> Each task is implemented inside the `src/` folder using a shared layout and styles.

---

## 📁 Project Structure

```text
course-project-itcs333-sec09-group-44/
│
├── assets/                    # Shared static assets (if needed later)
│
├── src/
│   │
│   ├── auth/                  # Authentication (Task 1 – used by admin & students)
│   │   ├── login.html         # Login page (email + password)
│   │   ├── login.js           # Client-side validation + AJAX login
│   │   ├── logout.php         # Destroys the session and redirects to login
│   │   ├── students.json      # Sample student data (JSON) – not used by PHP APIs
│   │   └── api/
│   │       └── index.php      # Login API (validates user and creates session)
│   │
│   ├── admin/                 # Admin portal (Task 1 – Ajlan)
│   │   ├── manage_users.php   # Protected admin page (change password + manage students)
│   │   ├── manage_users.js    # JS for student CRUD, search, sorting, password change
│   │   └── api/
│   │       ├── index.php      # Students API (GET/POST/PUT/DELETE via JSON)
│   │       ├── admin_password.php # Change admin password (current + new)
│   │       └── students.json  # Same sample students (JSON)
│   │
│   ├── resources/             # Task 2 – Course resources (to be implemented)
│   ├── weekly/                # Task 3 – Weekly breakdown (to be implemented)
│   ├── assignments/           # Task 4 – Assignments (to be implemented)
│   ├── discussion/            # Task 5 – Discussion board (to be implemented)
│   │
│   └── common/
│       └── styles.css         # Shared stylesheet used by login + admin + other pages
│
├── db_connect.php             # PDO connection to MySQL (used by all PHP APIs)
├── create_admin_user.php      # Helper script to create the initial admin account
├── index.html                 # Course homepage with navigation to all sections
├── README.md                  # Project documentation (this file)
└── LICENSE                    # Default license (from GitHub Classroom)

## ⚙️ How to Run the Project Locally (XAMPP)

1. **Copy the project to XAMPP**

   Place the repository folder inside:

   `C:\xampp\htdocs\course-project-itcs333-sec09-group-44`

2. **Start XAMPP**

   Start **Apache** and **MySQL** from the XAMPP Control Panel.

3. **Create the database**

   * Open phpMyAdmin at `http://localhost/phpmyadmin/`.

   * Create a database named:

     `itcs333_project`

   * Create the required tables.

   **Table `users`**

   * `id` (INT, PK, AUTO_INCREMENT)
   * `email` (VARCHAR)
   * `password` (VARCHAR, hashed with `password_hash`)
   * `role` (ENUM or VARCHAR – e.g., `admin` / `student`)
   * `created_at` (DATETIME)

   **Table `students`**

   * `id` (INT, PK, AUTO_INCREMENT)
   * `student_id` (VARCHAR)
   * `name` (VARCHAR)
   * `email` (VARCHAR)
   * `password` (VARCHAR, hashed)

4. **Create the initial admin account**

   Visit:

   `http://localhost/course-project-itcs333-sec09-group-44/create_admin_user.php`

   This script will insert an admin user into the `users` table
   (for example: email `admin@uob.edu.bh` with a secure password).

5. **Open the course homepage**

   In your browser, go to:

   `http://localhost/course-project-itcs333-sec09-group-44/index.html`

   Use the navigation menu to:

   * Go to **Login**
   * Log in as **admin**
   * Access the **Admin Portal (Manage Students)** page

---

## 🔐 Task 1 – Admin Portal & Authentication (Summary)

Implemented by **Ajlan Isa Ajlan Ramadhan (202303872)**.

### Features

* Secure login page with client-side validation (`login.html`, `login.js`).
* Login API using PDO prepared statements and password hashing (`src/auth/api/index.php`).
* PHP sessions to protect admin pages (`src/admin/manage_users.php`).

**Admin portal**

* Change admin password (current + new) via `admin_password.php`.
* Full CRUD for students:

  * Add student with default password (hashed in DB).
  * Edit student name and email (with validation and duplicate checks).
  * Optional change of student ID (with duplicate check).
  * Delete student.
* Search box (by name / ID / email).
* Clickable column headers for sorting (Name / Student ID / Email).
* Shared styling via `src/common/styles.css` to keep a consistent look.

---

## 🌐 Live Hosted Link

The course instructions mention hosting on Replit.
Currently, the project is developed and tested **locally** using XAMPP:

`http://localhost/course-project-itcs333-sec09-group-44/index.html`

(If the group later hosts the project online, the live URL can be added here.)

## 📝 Submission Notes

* This repository is the official GitHub Classroom repo for **ITCS333 – Group 44**.
© 2025 University of Bahrain – ITCS333 Course Project – **Group 44**
