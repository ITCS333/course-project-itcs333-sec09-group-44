# ITCS333 – Internet Software Development
## Course Project (2025/2026 – First Semester)
### 🧩 Group 44 – Section 09

Welcome to the **Course Page** project! This repository contains the source code for a dynamic, multi-user web application built for **ITCS333**. The system features a public homepage, a secure login system, an admin dashboard, course resources, weekly breakdowns, assignments, and discussion boards.

---

## 👥 Team Members & Responsibilities

| Task | Student Name | Student ID | Status |
| :--- | :--- | :--- | :--- |
| **1 – Admin Portal & User Management** | **Ajlan Isa Ajlan Ramadhan** | **202303872** | ✅ **Completed** |
| 2 – Course Resources | Hussain Yasser Ali | 202304049 | ✅ **Completed** |
| 3 – Weekly Breakdown | Khalid Abdulla | 202306240 | ✅ **Completed** |
| 4 – Assignments | Isa Nader Omran | 202303812 | ✅ **Completed** |
| 5 – Discussion Boards | *(Student 5 Name)* | *(Student 5 ID)* | ✅ **Completed** |

---

## ⚙️ How to Run Locally (XAMPP)

1. **Clone/Copy the Project**
   Place the project folder inside your `htdocs` directory:
   `C:\xampp\htdocs\course-project-itcs333-sec09-group-44`

2. **Database Setup**
   * Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
   * Create a new database named: **`course`**
   * Import the `schema.sql` file located in the project root.

3. **Insert Admin User (If not in schema)**
   You can manually insert an admin user to access the dashboard:
   INSERT INTO users (name, email, password, is_admin) 
   VALUES ('Admin', 'admin@uob.edu.bh', '$2y$10$YourHashedPasswordHere', 1);

*(Note: The password must be hashed using `password_hash` in PHP).*

4.  **Launch the Website**
    Open your browser and visit:
    `http://localhost/course-project-itcs333-sec09-group-44/index.html`

-----

## 📁 Project Structure

course-project-itcs333-sec09-group-44/
│
├── assets/                     # (Static assets like global images)
│
├── src/
│   ├── admin/                  # [TASK 1] Admin Portal
│   │   ├── api/
│   │   │   ├── index.php       # Admin PHP Logic (CRUD)
│   │   │   └── students.json   # (Mock data)
│   │   ├── manage_users.html   # Admin Dashboard UI
│   │   └── manage_users.js     # Admin Dashboard Logic
│   │
│   ├── assignments/            # [TASK 4] Assignments
│   │   ├── api/
│   │   │   ├── assignments.json
│   │   │   ├── comments.json
│   │   │   └── index.php
│   │   ├── admin.html
│   │   ├── admin.js
│   │   ├── details.html
│   │   ├── details.js
│   │   ├── list.html
│   │   └── list.js
│   │
│   ├── auth/                   # [TASK 1] Authentication
│   │   ├── api/
│   │   │   ├── index.php       # Login PHP Logic
│   │   │   ├── logout.php      # [NEW] Logout Logic
│   │   │   └── me.php          # [NEW] Session Check Logic
│   │   ├── login.html          # Login Page UI
│   │   ├── login.js            # Login Page Logic
│   │   └── students.json       # (Mock data)
│   │
│   ├── common/                 # Shared Code
│   │   ├── auth.php            # Shared PHP Auth checks
│   │   ├── db.php              # Database Connection (PDO)
│   │   └── styles.css          # Global Styles
│   │
│   ├── discussion/             # [TASK 5] Discussion Boards
│   │   ├── api/
│   │   │   ├── comments.json
│   │   │   ├── index.php
│   │   │   └── topics.json
│   │   ├── baord.html          # Discussion Board UI
│   │   ├── board.js
│   │   ├── topic.html
│   │   └── topic.js
│   │
│   ├── resources/              # [TASK 2] Course Resources
│   │   ├── api/
│   │   │   ├── comments.json
│   │   │   ├── index.php
│   │   │   └── resources.json
│   │   ├── admin.html
│   │   ├── admin.js
│   │   ├── details.html
│   │   ├── details.js
│   │   ├── list.html
│   │   └── list.js
│   │
│   └── weekly/                 # [TASK 3] Weekly Breakdown
│       ├── api/
│       │   ├── comments.json
│       │   ├── index.php
│       │   └── weeks.json
│       ├── admin.html
│       ├── admin.js
│       ├── details.html
│       ├── details.js
│       ├── list.html
│       └── list.js
│
├── .gitignore
├── index.html                  # Main Homepage (Entry Point)
├── LICENSE
├── README.md
└── schema.sql                  # Database creation script
```

-----

## 🔐 Task Highlights

### Task 1: Admin & Auth (Ajlan)

  * **Authentication:** Secure Login/Logout with PHP Sessions and Password Hashing.
  * **Admin Dashboard:** Full CRUD (Create, Read, Update, Delete) capabilities for student management.
  * **Security:** Role-based access control protects admin pages from unauthorized access.

### Task 2: Course Resources (Hussain)

  * Upload and manage course materials (PDFs, Links).
  * Students can view and download resources.
  * Comment section for each resource.

### Task 3: Weekly Breakdown (Khalid)

  * Organizes course content by week.
  * Admin can add/edit weekly plans.
  * Detailed view for specific weekly objectives.

### Task 4: Assignments (Isa)

  * Lists all course assignments with due dates.
  * Admin interface to create new assignments.
  * Detail views for specific assignment instructions.

### Task 5: Discussion Boards

  * General forum for course-related topics.
  * Allows students and teachers to create topics and reply to threads.

-----

© 2025 University of Bahrain – ITCS333