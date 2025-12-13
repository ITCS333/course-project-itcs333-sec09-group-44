<!--
  Task 1 – Change Password Page
  Student: Ajlan Isa Ajlan Ramadhan  ID: 202303872  Group: 44
-->
<?php
session_start();
require_once "../includes/db_connect.php";

// Only admin can access this page
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "admin") {
    header("Location: ../login.php");
    exit();
}

$message = "";

// Handle password change form
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $current_password = trim($_POST["current_password"]);
    $new_password = trim($_POST["new_password"]);
    $confirm_password = trim($_POST["confirm_password"]);

    // Get current admin info
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION["user_id"]]);
    $admin = $stmt->fetch();

    // Verify old password
    if (!$admin || !password_verify($current_password, $admin["password"])) {
        $message = "❌ Current password is incorrect.";
    } elseif ($new_password !== $confirm_password) {
        $message = "❌ New passwords do not match.";
    } else {
        // Hash the new password
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $update_stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $update_stmt->execute([$hashed_password, $_SESSION["user_id"]]);
        $message = "✅ Password updated successfully!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Change Password - ITCS333</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <header>
    <h1>Change Password</h1>
    <nav>
      <a href="dashboard.php">Dashboard</a>
      <a href="students.php">Manage Students</a>
      <a href="../logout.php">Logout</a>
    </nav>
  </header>

  <main>
    <section>
      <h2>Update Your Password</h2>

      <?php if ($message): ?>
        <p style="color:green; font-weight:bold;"><?php echo $message; ?></p>
      <?php endif; ?>

      <form method="POST" action="">
        <label>Current Password:</label>
        <input type="password" name="current_password" required>

        <label>New Password:</label>
        <input type="password" name="new_password" required>

        <label>Confirm New Password:</label>
        <input type="password" name="confirm_password" required>

        <button type="submit">Change Password</button>
      </form>
    </section>
  </main>

 <footer>
  <p>Group 44 | Ajlan Isa Ajlan Ramadhan - Admin Portal 2025</p>
</footer>
</body>
</html>