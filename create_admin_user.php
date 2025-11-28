<?php
/**
 * Helper script to create the initial admin user.
 * Run it ONCE in the browser, then you can leave or delete this file.
 *
 * URL:
 *   http://localhost/course-project-itcs333-sec09-group-44/create_admin_user.php
 */

require_once __DIR__ . "/db_connect.php"; // gives $pdo

// --- configure the initial admin account here ---
$adminEmail    = "admin@uob.edu.bh";
$adminPassword = "Admin123"; // you can change this, but remember it
$adminRole     = "admin";

try {
    // 1) Check if this admin already exists
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $check->execute([":email" => $adminEmail]);

    if ($check->fetch()) {
        echo "<h2>Admin already exists.</h2>";
        echo "<p>Email: <strong>" . htmlspecialchars($adminEmail) . "</strong></p>";
        exit;
    }

    // 2) Insert new admin
    $hash = password_hash($adminPassword, PASSWORD_DEFAULT);

    $insert = $pdo->prepare(
        "INSERT INTO users (email, password, role, created_at)
         VALUES (:email, :password, :role, NOW())"
    );

    $insert->execute([
        ":email"    => $adminEmail,
        ":password" => $hash,
        ":role"     => $adminRole,
    ]);

    echo "<h2>Admin user created successfully ✅</h2>";
    echo "<p>Email: <strong>" . htmlspecialchars($adminEmail) . "</strong></p>";
    echo "<p>Password: <strong>" . htmlspecialchars($adminPassword) . "</strong></p>";
    echo "<p>You can now go to:
        <a href=\"src/auth/login.html\">Login page</a>
    </p>";

} catch (PDOException $e) {
    echo "<h2>Error creating admin user ❌</h2>";
    echo "<pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
}