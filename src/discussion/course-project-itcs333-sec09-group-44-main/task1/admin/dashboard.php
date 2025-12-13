<!--
  Task 1 – Admin Dashboard
  Student: Ajlan Isa Ajlan Ramadhan  ID: 202303872  Group: 44
-->
<?php
session_start();

// protect the page
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "admin") {
    header("Location: ../login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - ITCS333</title>
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <header>
    <h1>Welcome, <?php echo htmlspecialchars($_SESSION["user_name"]); ?> 👋</h1>
    <nav>
      <a href="dashboard.php">Dashboard</a>
      <a href="students.php">Manage Students</a>
      <a href="../logout.php">Logout</a>
    </nav>
  </header>

  <main>
    <section>
      <h2>Welcome to the Admin Dashboard</h2>
      <p>Here you can manage students, view course data, and update your password.</p>

      <div class="dashboard-boxes">
        <div class="box">
          <h3>👨‍🎓 Students</h3>
          <p>Add, view, or remove student accounts.</p>
          <a class="btn" href="students.php">Manage Students</a>
        </div>

        <div class="box">
          <h3>🔒 Password</h3>
          <p>Change your admin password here.</p>
          <a class="btn" href="change_password.php">Change Password</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
  <p>Group 44 | Ajlan Isa Ajlan Ramadhan - Admin Portal 2025</p>
</footer>
</body>
</html>