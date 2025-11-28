<?php
require_once "db_connect.php";

// delete any existing admin with that email
$conn->query("DELETE FROM users WHERE email = 'admin@uob.edu.bh'");

// create fresh admin with password admin123
$passwordHash = password_hash("admin123", PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')");
$stmt->bind_param("ss", $email, $password);

$email = "admin@uob.edu.bh";
$password = $passwordHash;

if ($stmt->execute()) {
    echo "Admin user created successfully.";
} else {
    echo "Error: " . $stmt->error;
}