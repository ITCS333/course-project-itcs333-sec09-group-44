<?php
session_start();

// Protect page: only logged-in admin can access
if (
    empty($_SESSION["logged_in"]) ||
    ($_SESSION["user_role"] ?? "") !== "admin"
) {
    header("Location: ../auth/login.html");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Portal</title>

    <link rel="stylesheet" href="../common/styles.css">

    <style>
        .admin-shell {
            max-width: 1100px;
            margin: 40px auto;
            padding: 24px 28px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 12px rgba(0,0,0,0.08);
        }

        header.topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        header.topbar h1 {
            margin: 0;
        }

        .user-info {
            font-size: 0.9rem;
        }

        .user-info a {
            margin-left: 10px;
        }

        section {
            margin-top: 28px;
        }

        fieldset {
            border-radius: 6px;
            padding: 12px 16px;
        }

        .form-row {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-top: 10px;
        }

        .form-field {
            display: flex;
            flex-direction: column;
            min-width: 180px;
        }

        .form-field label {
            margin-bottom: 4px;
            font-weight: 500;
        }

        .form-field input {
            padding: 6px 8px;
        }

        .button-primary {
            margin-top: 10px;
        }

        #search-input {
            margin-top: 15px;
            margin-bottom: 10px;
            width: 100%;
            max-width: 260px;
            padding: 6px 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        th, td {
            padding: 8px 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }

        th.sortable {
            cursor: pointer;
        }

        th.sortable::after {
            content: " ⇅";
            font-size: 0.8rem;
            color: #555;
        }

        .actions button {
            margin-right: 4px;
        }
    </style>
</head>
<body>

<div class="admin-shell">

    <header class="topbar">
        <h1>Admin Portal</h1>
        <div class="user-info">
            Logged in as: <strong><?php echo htmlspecialchars($_SESSION["user_email"]); ?></strong>
            <a href="../auth/logout.php">Logout</a>
        </div>
    </header>

    <!-- Password section -->
    <section>
        <h2>Change Your Password</h2>

        <form id="password-form" action="#" method="post">
            <fieldset>
                <legend>Password Update</legend>

                <div class="form-row">
                    <div class="form-field">
                        <label for="current-password">Current Password</label>
                        <input type="password" id="current-password" required>
                    </div>

                    <div class="form-field">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" minlength="8" required>
                    </div>

                    <div class="form-field">
                        <label for="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" required>
                    </div>
                </div>

                <button type="submit" id="change" class="button-primary">
                    Update Password
                </button>
            </fieldset>
        </form>
    </section>

    <!-- Student management section -->
    <section>
        <h2>Manage Students</h2>

        <!-- Add student form -->
        <details>
            <summary>Add New Student</summary>

            <form id="add-student-form" action="#" method="post">
                <fieldset>
                    <legend>New Student Information</legend>

                    <div class="form-row">
                        <div class="form-field">
                            <label for="student-name">Full Name</label>
                            <input type="text" id="student-name" required>
                        </div>

                        <div class="form-field">
                            <label for="student-id">Student ID</label>
                            <input type="text" id="student-id" required>
                        </div>

                        <div class="form-field">
                            <label for="student-email">Email Address</label>
                            <input type="email" id="student-email" required>
                        </div>

                        <div class="form-field">
                            <label for="default-password">Default Password</label>
                            <input type="text" id="default-password" value="password123">
                        </div>
                    </div>

                    <button type="submit" id="add" class="button-primary">
                        Add Student
                    </button>
                </fieldset>
            </form>
        </details>

        <!-- Search box -->
        <input
            type="text"
            id="search-input"
            placeholder="Search by name..."
        >

        <h3>Registered Students</h3>

        <table id="student-table">
            <thead>
                <tr>
                    <th class="sortable" data-sort="name">Name</th>
                    <th class="sortable" data-sort="student_id">Student ID</th>
                    <th class="sortable" data-sort="email">Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="student-table-body">
                <!-- Filled by JavaScript -->
            </tbody>
        </table>
    </section>

</div>

<script src="manage_users.js" defer></script>
</body>
</html>