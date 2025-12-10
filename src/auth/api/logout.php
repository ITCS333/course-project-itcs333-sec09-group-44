<?php
// src/auth/api/logout.php
declare(strict_types=1);

// Adjust this path if needed. 
// From src/auth/api/ to src/common/ is ../../common/
require_once __DIR__ . '/../../common/auth.php';

auth_logout();

header('Content-Type: application/json');
echo json_encode(['success' => true]);
?>