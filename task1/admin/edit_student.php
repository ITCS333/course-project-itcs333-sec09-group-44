<!--
  Task 1 – Edit Student
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

$message = "";

// Get student ID from URL
if (!isset($_GET["id"])) {
    header("Location: students.php");
    exit();
}

$id = $_GET["id"];

// Fetch current student data
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND role = 'student'");
$stmt->execute([$id]);
$student = $stmt->fetch();

if (!$student) {
    die("❌ Student not found.");
}

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"]);
    $student_id = trim($_POST["student_id"]);
    $email = trim($_POST["email"]);

    try {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, student_id = ?, email = ? WHERE id = ?");
        $stmt->execute([$name, $student_id, $email, $id]);
        $message = "✅ Student updated successfully!";
        // Refresh the student data
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $student = $stmt->fetch();
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
  <title>Edit Student - ITCS333</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <header>
    <h1>Edit Student</h1>
    <nav>
      <a href="dashboard.php">Dashboard</a>
      <a href="students.php">Back to Students</a>
      <a href="../logout.php">Logout</a>
    </nav>
  </header>

  <main>
    <section>
      <h2>Update Student Information</h2>

      <?php if ($message): ?>
        <p style="color:green; font-weight:bold;"><?php echo $message; ?></p>
      <?php endif; ?>

      <form method="POST" action="">
        <label>Full Name:</label>
        <input type="text" name="name" value="<?php echo htmlspecialchars($student['name']); ?>" required>

        <label>Student ID:</label>
        <input type="text" name="student_id" value="<?php echo htmlspecialchars($student['student_id']); ?>" required>

        <label>Email:</label>
        <input type="email" name="email" value="<?php echo htmlspecialchars($student['email']); ?>" required>

        <button type="submit">Update Student</button>
      </form>
    </section>
  </main>

 <footer>
  <p>Group 44 | Ajlan Isa Ajlan Ramadhan - Admin Portal 2025</p>
</footer>
</body>
</html>