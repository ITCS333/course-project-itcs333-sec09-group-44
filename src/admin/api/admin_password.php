<?php
/**
 * Change password for the logged-in admin (users table).
 */

session_start();
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

if (empty($_SESSION["user_id"]) || ($_SESSION["user_role"] ?? "") !== "admin") {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

$current = $data["current_password"] ?? "";
$new     = $data["new_password"]     ?? "";

if ($current === "" || $new === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Both passwords are required"]);
    exit;
}

if (strlen($new) < 8) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must be at least 8 characters"]);
    exit;
}

require_once "../../../db_connect.php"; // $pdo

try {
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = :id AND role = 'admin'");
    $stmt->execute([":id" => $_SESSION["user_id"]]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($current, $row["password"])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
        exit;
    }

    $newHash = password_hash($new, PASSWORD_DEFAULT);

    $update = $pdo->prepare("UPDATE users SET password = :pwd WHERE id = :id");
    $ok     = $update->execute([
        ":pwd" => $newHash,
        ":id"  => $_SESSION["user_id"],
    ]);

    if ($ok) {
        echo json_encode(["success" => true, "message" => "Password updated successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Update failed"]);
    }
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error"]);
}