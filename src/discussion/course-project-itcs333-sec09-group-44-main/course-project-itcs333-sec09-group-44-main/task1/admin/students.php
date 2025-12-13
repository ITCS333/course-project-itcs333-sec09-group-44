<!--
  Task 1 – Manage Students Page
  Student: Ajlan Isa Ajlan Ramadhan  ID: 202303872  Group: 44
-->
<?php
session_start();
require_once "../includes/db_connect.php";

// Protect the page
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "admin") {
    header("Location: ../login.php");
    exit();
}

// Fetch all students
$stmt = $pdo->prepare("SELECT * FROM users WHERE role = 'student'");
$stmt->execute();
$students = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manage Students - ITCS333</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <header>
    <h1>Manage Students</h1>
    <nav>
      <a href="dashboard.php">Dashboard</a>
      <a href="add_student.php">Add Student</a>
      <a href="../logout.php">Logout</a>
    </nav>
  </header>

  <main>
    <section>
      <h2>Registered Students</h2>
      <table border="1" cellpadding="10" cellspacing="0" style="width:100%; border-collapse:collapse;">
        <tr style="background:#1a73e8; color:white;">
          <th>ID</th>
          <th>Name</th>
          <th>Student ID</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
        <?php foreach ($students as $student): ?>
          <tr>
            <td><?= htmlspecialchars($student["id"]) ?></td>
            <td><?= htmlspecialchars($student["name"]) ?></td>
            <td><?= htmlspecialchars($student["student_id"]) ?></td>
            <td><?= htmlspecialchars($student["email"]) ?></td>
            <td>
              <a href="edit_student.php?id=<?= $student['id'] ?>">Edit</a> |
              <a href="delete_student.php?id=<?= $student['id'] ?>" onclick="return confirm('Delete this student?');">Delete</a>
            </td>
          </tr>
        <?php endforeach; ?>
      </table>

      <?php if (count($students) === 0): ?>
        <p>No students registered yet.</p>
      <?php endif; ?>
    </section>
  </main>

 <footer>
  <p>Group 44 | Ajlan Isa Ajlan Ramadhan - Admin Portal 2025</p>
</footer>
</body>
</html>