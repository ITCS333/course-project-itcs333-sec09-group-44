<!--
  Task 1 – Login Page
  Student: Ajlan Isa Ajlan Ramadhan  ID: 202303872
-->
<?php
session_start();
require_once "includes/db_connect.php"; // connect to db

$error = ""; // store error text

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);

    // Fetch user by email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user["password"])) {
        // store session data
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["user_name"] = $user["name"];
        $_SESSION["role"] = $user["role"];

        // redirect based on role
        if ($user["role"] === "admin") {
            header("Location: admin/dashboard.php");
        } else {
            header("Location: index.html");
        }
        exit();
    } else {
        $error = "Invalid email or password.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - ITCS333</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="container">
    <h2>Login</h2>
    <?php if ($error): ?>
      <p style="color:red;"><?php echo $error; ?></p>
    <?php endif; ?>

    <form method="POST" action="">
      <label>Email:</label>
      <input type="email" name="email" required>

      <label>Password:</label>
      <input type="password" name="password" required>

      <button type="submit">Login</button>
    </form>

    <p><a href="index.html">Back to Home</a></p>
  </main>
</body>
</html>
