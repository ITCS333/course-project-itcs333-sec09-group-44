# ITCS333 – Internet Software Development

## Course Project (2025 / 2026 – First Semester)

### Group 44 – Section 09

This repository contains the group project for **ITCS333: Internet Software Development** at the **University of Bahrain**.

The project implements a small course website with:
- An **authentication system** (login / logout)
- An **admin portal** to manage students
- Pages for **course resources, weekly breakdown, assignments, and discussion board** (Tasks 2–5)

---

## 👥 Group Members

| #  | Name                             | Student ID  |
|----|----------------------------------|-------------|
| 1  | **Ajlan Isa Ajlan Ramadhan**     | **202303872** |
| 2  | **Hussain Yasser Ali**           | **202304049** |
| 3  | **Khalid Abdulla**               | **202306240** |
| 4  | **[Member 4 Name]**              | **[Member 4 ID]** |
| 5  | **Isa Nader Omran**              | **202303812** |

---

## 🧩 Task Responsibilities

| Task | Description                               | Responsible Student                     | ID         | Status     |
|------|-------------------------------------------|-----------------------------------------|------------|------------|
| 1    | Admin Portal & User Management (Login, Admin Manage Students) | **Ajlan Isa Ajlan Ramadhan** | **202303872** | ✅ Completed |
| 2    | Course Resources (Admin & Student views)  | **Hussain Yasser Ali**                  | **202304049** | 🔄 In Progress |
| 3    | Weekly Breakdown                          | **Khalid Abdulla**                      | **202306240** | 🔄 In Progress |
| 4    | Assignments                               | **[Member 4 Name]**                     | **[Member 4 ID]** | 🔄 In Progress |
| 5    | Discussion Board                          | **Isa Nader Omran**                     | **202303812** | 🔄 In Progress |

Update the **Status** column when each task is finished.

---

## 🌐 Live Hosted Application (Replit)

Live demo (Replit):

👉 [https://replit.com/@YOUR_USERNAME/itcs333-group44](https://replit.com/@YOUR_USERNAME/itcs333-group44)

> 🔧 Replace the link above with your actual Replit project URL when you deploy.

---

## 🗂 Project Structure

Main folders (simplified):

```text
course-project-itcs333-sec09-group-44/
│
├── db_connect.php           # Database connection (PDO)
├── index.html               # Course homepage (navigation to all main pages)
├── README.md
│
└── src/
    ├── common/
    │   └── styles.css       # Shared styling
    │
    ├── auth/
    │   ├── login.html       # Login page
    │   ├── login.js         # Client-side validation + fetch to auth API
    │   ├── logout.php       # Destroys session and redirects to login
    │   └── api/
    │       └── index.php    # Authentication API (JSON, sessions)
    │
    ├── admin/
    │   ├── manage_users.php     # Admin-only page (password + students)
    │   ├── manage_users.js      # Fetches students, CRUD, change password
    │   └── api/
    │       ├── index.php        # Students API (CRUD)
    │       └── admin_password.php # Change admin password
    │
    ├── resources/               # Task 2 pages (to be implemented)
    ├── weekly/                  # Task 3 pages (to be implemented)
    ├── assignments/             # Task 4 pages (to be implemented)
    └── discussion/              # Task 5 pages (to be implemented)
🛠️ How to Run Locally (XAMPP)
Copy the project folder into your XAMPP htdocs directory, e.g.:

text
Copy code
C:\xampp\htdocs\course-project-itcs333-sec09-group-44\
Start Apache and MySQL in XAMPP Control Panel.

Create the database in phpMyAdmin:

Database name: itcs333_project

Import the SQL file that contains:

users table (for login)

students table (for Task 1 admin portal)

Make sure db_connect.php matches your local DB settings:

php
Copy code
$host = "localhost";
$db   = "itcs333_project";
$user = "root";
$pass = "";
Open the site in your browser:

text
Copy code
http://localhost/course-project-itcs333-sec09-group-44/index.html
Use a valid user from the users table to log in:

If the user has role = 'admin', they will be redirected to the Admin Portal.

Normal users are redirected to the main course page.

✅ Task 1 – Admin Portal Summary
Task 1 (by Ajlan Isa Ajlan Ramadhan – 202303872) implements:

Login page (src/auth/login.html)

Client-side validation (email format, password length)

Sends JSON { email, password } to src/auth/api/index.php

Authentication API (src/auth/api/index.php)

Validates input

Checks hashed password using password_verify

Starts session and stores user_id, user_email, user_role, logged_in

Admin protection

src/admin/manage_users.php checks session and user_role === 'admin'

Redirects to login.html if not logged in as admin

Admin Portal features:

Change admin password (admin_password.php + form + JS)

View students in a table

Add new student (with default hashed password)

Edit student (name/email)

Delete student

Search and sort by name, student ID, or email

© 2025 University of Bahrain – ITCS333 Course Project – Group 44