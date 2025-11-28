<?php
/**
 * Authentication API
 * Accepts JSON {email, password} via POST and creates a session.
 */

session_start();
header("Content-Type: application/json; charset=utf-8");

// Only JSON POST allowed
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    echo json_encode(["success" => true]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Read JSON body
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!is_array($data) || empty($data["email"]) || empty($data["password"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

$email    = trim($data["email"]);
$password = $data["password"];

// Basic validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must be at least 8 characters"]);
    exit;
}

require_once "../../../db_connect.php"; // provides $pdo

try {
    $stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = :email");
    $stmt->execute([":email" => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user["password"])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid email or password"]);
        exit;
    }

    // Store session info
    $_SESSION["user_id"]    = $user["id"];
    $_SESSION["user_email"] = $user["email"];
    $_SESSION["user_role"]  = $user["role"];
    $_SESSION["logged_in"]  = true;

    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user"    => [
            "id"    => $user["id"],
            "email" => $user["email"],
            "role"  => $user["role"],
        ],
    ]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error"]);
}