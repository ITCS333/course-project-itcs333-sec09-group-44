<?php
/**
 * Main API Router for Course Management System
 * Handles requests for weeks and comments resources
 */
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

// Get the resource from query string
$resource = $_GET['resource'] ?? '';

// Route to appropriate handler
switch ($resource) {
    case 'weeks':
        require_once 'weeks.php';
        handleWeeksRequest();
        break;
    
    case 'comments':
        require_once 'comments.php';
        handleCommentsRequest();
        break;
    
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid resource. Use ?resource=weeks or ?resource=comments']);
        break;
}
?>
