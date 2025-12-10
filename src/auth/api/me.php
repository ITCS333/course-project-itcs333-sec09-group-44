<?php
// src/auth/api/me.php
declare(strict_types=1);
require_once __DIR__ . '/../../common/auth.php';

header('Content-Type: application/json');

$user = auth_current_user();

if ($user) {
    echo json_encode(['logged_in' => true, 'role' => $user['role'], 'name' => $_SESSION['user_name'] ?? 'User']);
} else {
    echo json_encode(['logged_in' => false]);
}
?>