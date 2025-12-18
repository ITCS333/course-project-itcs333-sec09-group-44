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

require_once __DIR__ . '/../../common/db.php';
try {
// Read and parse request body
    $requestBody = file_get_contents('php://input');
    $requestData = json_decode($requestBody, true);

// Session can be used to store user data
// Example: $_SESSION['user_id'] = $userId;
    if (!isset($_SESSION['initialized'])) {
    $_SESSION['initialized'] = true;
    $_SESSION['request_count'] = 0;
    }
    $_SESSION['request_count']++;

    // Initialize database connection 
    $pdo = getDBConnection();
    
// Database operations use PDO prepared statements
// Example: $stmt = $pdo->prepare("SELECT * FROM weeks WHERE id = ?");
// Example: $stmt->execute([$id]);
// Example: $result = $stmt->fetch();
    $stmt = $pdo->prepare("SELECT 1");
    $stmt->execute();
    $result = $stmt->fetch();
    
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
} catch (PDOException $e) {
    error_log('Database Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}  
?>
