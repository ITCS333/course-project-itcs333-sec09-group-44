<!--
  Task 1 – Add Student
  Student: Ajlan Isa Ajlan Ramadhan  ID: 202303872  Group: 44
-->
<?php
session_start();
require_once "../includes/db_connect.php";

// Only admin can access
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "admin") {
    header("Location: ../login.php");
    exit();
}

$message = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"]);
    $student_id = trim($_POST["student_id"]);
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);

    // Hash the password before saving
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, student_id, email, password, role) VALUES (?, ?, ?, ?, 'student')");
        $stmt->execute([$name, $student_id, $email, $hashed_password]);
        $message = "✅ Student added successfully!";
    } catch (PDOException $e) {
        $message = "❌ Error: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Add Student - ITCS333</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <header>
    <h1>Add New Student</h1>
    <nav>
      <a href="dashboard.php">Dashboard</a>
      <a href="students.php">Back to Students</a>
      <a href="../logout.php">Logout</a>
    </nav>
  </header>

  <main>
    <section>
      <h2>Enter Student Details</h2>

      <?php if ($message): ?>
        <p style="color:green; font-weight:bold;"><?php echo $message; ?></p>
      <?php endif; ?>

      <form method="POST" action="">
        <label>Full Name:</label>
        <input type="text" name="name" required>

        <label>Student ID:</label>
        <input type="text" name="student_id" required>

        <label>Email:</label>
        <input type="email" name="email" required>

        <label>Password:</label>
        <input type="password" name="password" required>

        <button type="submit">Add Student</button>
      </form>
    </section>
  </main>

 <footer>
  <p>Group 44 | Ajlan Isa Ajlan Ramadhan - Admin Portal 2025</p>
</footer>
</body>
</html>