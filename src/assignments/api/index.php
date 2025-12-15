<?php
/**
 * Assignment Management API
 * 
 * This is a RESTful API that handles all CRUD operations for course assignments
 * and their associated discussion comments.
 * It uses PDO to interact with a MySQL database.
 * 
 * Database Table Structures (for reference):
 * 
 * Table: assignments
 * Columns:
 *   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
 *   - title (VARCHAR(200))
 *   - description (TEXT)
 *   - due_date (DATE)
 *   - files (TEXT)
 *   - created_at (TIMESTAMP)
 *   - updated_at (TIMESTAMP)
 * 
 * Table: comments
 * Columns:
 *   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
 *   - assignment_id (VARCHAR(50), FOREIGN KEY)
 *   - author (VARCHAR(100))
 *   - text (TEXT)
 *   - created_at (TIMESTAMP)
 * 
 * HTTP Methods Supported:
 *   - GET: Retrieve assignment(s) or comment(s)
 *   - POST: Create a new assignment or comment
 *   - PUT: Update an existing assignment
 *   - DELETE: Delete an assignment or comment
 * 
 * Response Format: JSON
 */

// Sessions ensure per-user state; start before sending headers.
session_start();

// Initialize a basic session payload when missing so $_SESSION is always available for user data.
if (!isset($_SESSION['user_context'])) {
    $_SESSION['user_context'] = [
        'role' => 'guest',
        'initialized_at' => time(),
    ];
}

// ============================================================================
// HEADERS AND CORS CONFIGURATION
// ============================================================================

header('Content-Type: application/json');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}



// ============================================================================
// DATABASE CONNECTION
// ============================================================================

require_once '../../../db_connect.php';

// $db is already created by db_connect.php

$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);



// ============================================================================
// REQUEST PARSING
// ============================================================================

$method = $_SERVER['REQUEST_METHOD'];

$data = null;
if ($method === 'POST' || $method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
}

$queryParams = $_GET;



// ============================================================================
// ASSIGNMENT CRUD FUNCTIONS
// ============================================================================

/**
 * Function: Get all assignments
 * Method: GET
 * Endpoint: ?resource=assignments
 * 
 * Query Parameters:
 *   - search: Optional search term to filter by title or description
 *   - sort: Optional field to sort by (title, due_date, created_at)
 *   - order: Optional sort order (asc or desc, default: asc)
 * 
 * Response: JSON array of assignment objects
 */
function getAllAssignments($db) {
    $sql = "SELECT * FROM assignments WHERE 1=1";
    $params = [];
    
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $sql .= " AND (title LIKE :search OR description LIKE :search)";
        $params[':search'] = '%' . $_GET['search'] . '%';
    }
    
    $allowedSortFields = ['title', 'due_date', 'created_at'];
    $sortField = 'created_at';
    $sortOrder = 'asc';
    
    if (isset($_GET['sort']) && in_array($_GET['sort'], $allowedSortFields)) {
        $sortField = $_GET['sort'];
    }
    
    if (isset($_GET['order']) && in_array(strtolower($_GET['order']), ['asc', 'desc'])) {
        $sortOrder = strtolower($_GET['order']);
    }
    
    $sql .= " ORDER BY $sortField $sortOrder";
    
    $stmt = $db->prepare($sql);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($assignments as &$assignment) {
        if (isset($assignment['files'])) {
            $assignment['files'] = json_decode($assignment['files'], true);
        }
    }
    
    sendResponse(['success' => true, 'data' => $assignments]);
}


/**
 * Function: Get a single assignment by ID
 * Method: GET
 * Endpoint: ?resource=assignments&id={assignment_id}
 * 
 * Query Parameters:
 *   - id: The assignment ID (required)
 * 
 * Response: JSON object with assignment details
 */
function getAssignmentById($db, $assignmentId) {
    if (empty($assignmentId)) {
        sendResponse(['success' => false, 'message' => 'Assignment ID is required'], 400);
    }
    
    $sql = "SELECT * FROM assignments WHERE id = :id";
    $stmt = $db->prepare($sql);
    
    $stmt->bindParam(':id', $assignmentId);
    
    $stmt->execute();
    
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$assignment) {
        sendResponse(['success' => false, 'message' => 'Assignment not found'], 404);
    }
    
    if (isset($assignment['files'])) {
        $assignment['files'] = json_decode($assignment['files'], true);
    }
    
    sendResponse(['success' => true, 'data' => $assignment]);
}


/**
 * Function: Create a new assignment
 * Method: POST
 * Endpoint: ?resource=assignments
 * 
 * Required JSON Body:
 *   - title: Assignment title (required)
 *   - description: Assignment description (required)
 *   - due_date: Due date in YYYY-MM-DD format (required)
 *   - files: Array of file URLs/paths (optional)
 * 
 * Response: JSON object with created assignment data
 */
function createAssignment($db, $data) {
    if (empty($data['title']) || empty($data['description']) || empty($data['due_date'])) {
        sendResponse(['success' => false, 'message' => 'Title, description, and due_date are required'], 400);
    }
    
    $title = sanitizeInput($data['title']);
    $description = sanitizeInput($data['description']);
    $dueDate = $data['due_date'];
    
    if (!validateDate($dueDate)) {
        sendResponse(['success' => false, 'message' => 'Invalid due_date format. Use YYYY-MM-DD'], 400);
    }
    
    $assignmentId = 'asg_' . time() . '_' . mt_rand(1000, 9999);
    
    $files = isset($data['files']) ? json_encode($data['files']) : json_encode([]);
    
    $sql = "INSERT INTO assignments (id, title, description, due_date, files, created_at, updated_at) 
            VALUES (:id, :title, :description, :due_date, :files, NOW(), NOW())";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':id', $assignmentId);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':due_date', $dueDate);
    $stmt->bindParam(':files', $files);
    
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        sendResponse(['success' => true, 'message' => 'Assignment created successfully', 'data' => ['id' => $assignmentId]], 201);
    }
    
    sendResponse(['success' => false, 'message' => 'Failed to create assignment'], 500);
}


/**
 * Function: Update an existing assignment
 * Method: PUT
 * Endpoint: ?resource=assignments
 * 
 * Required JSON Body:
 *   - id: Assignment ID (required, to identify which assignment to update)
 *   - title: Updated title (optional)
 *   - description: Updated description (optional)
 *   - due_date: Updated due date (optional)
 *   - files: Updated files array (optional)
 * 
 * Response: JSON object with success status
 */
function updateAssignment($db, $data) {
    if (empty($data['id'])) {
        sendResponse(['success' => false, 'message' => 'Assignment ID is required'], 400);
    }
    
    $assignmentId = $data['id'];
    
    $stmt = $db->prepare("SELECT id FROM assignments WHERE id = :id");
    $stmt->bindParam(':id', $assignmentId);
    $stmt->execute();
    if ($stmt->rowCount() === 0) {
        sendResponse(['success' => false, 'message' => 'Assignment not found'], 404);
    }
    
    $updateFields = [];
    $params = [':id' => $assignmentId];
    
    if (isset($data['title'])) {
        $updateFields[] = "title = :title";
        $params[':title'] = sanitizeInput($data['title']);
    }
    
    if (isset($data['description'])) {
        $updateFields[] = "description = :description";
        $params[':description'] = sanitizeInput($data['description']);
    }
    
    if (isset($data['due_date'])) {
        if (!validateDate($data['due_date'])) {
            sendResponse(['success' => false, 'message' => 'Invalid due_date format. Use YYYY-MM-DD'], 400);
        }
        $updateFields[] = "due_date = :due_date";
        $params[':due_date'] = $data['due_date'];
    }
    
    if (isset($data['files'])) {
        $updateFields[] = "files = :files";
        $params[':files'] = json_encode($data['files']);
    }
    
    if (empty($updateFields)) {
        sendResponse(['success' => false, 'message' => 'No fields to update'], 400);
    }
    
    $updateFields[] = "updated_at = NOW()";
    $sql = "UPDATE assignments SET " . implode(', ', $updateFields) . " WHERE id = :id";
    
    $stmt = $db->prepare($sql);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        sendResponse(['success' => true, 'message' => 'Assignment updated successfully']);
    }
    
    sendResponse(['success' => true, 'message' => 'No changes made']);
}


/**
 * Function: Delete an assignment
 * Method: DELETE
 * Endpoint: ?resource=assignments&id={assignment_id}
 * 
 * Query Parameters:
 *   - id: Assignment ID (required)
 * 
 * Response: JSON object with success status
 */
function deleteAssignment($db, $assignmentId) {
    if (empty($assignmentId)) {
        sendResponse(['success' => false, 'message' => 'Assignment ID is required'], 400);
    }
    
    $stmt = $db->prepare("SELECT id FROM assignments WHERE id = :id");
    $stmt->bindParam(':id', $assignmentId);
    $stmt->execute();
    if ($stmt->rowCount() === 0) {
        sendResponse(['success' => false, 'message' => 'Assignment not found'], 404);
    }
    
    $deleteComments = $db->prepare("DELETE FROM comments_assignment WHERE assignment_id = :assignment_id");
    $deleteComments->bindParam(':assignment_id', $assignmentId);
    $deleteComments->execute();
    
    $sql = "DELETE FROM assignments WHERE id = :id";
    $stmt = $db->prepare($sql);
    
    $stmt->bindParam(':id', $assignmentId);
    
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        sendResponse(['success' => true, 'message' => 'Assignment deleted successfully']);
    }
    
    sendResponse(['success' => false, 'message' => 'Failed to delete assignment'], 500);
}


// ============================================================================
// COMMENT CRUD FUNCTIONS
// ============================================================================

/**
 * Function: Get all comments for a specific assignment
 * Method: GET
 * Endpoint: ?resource=comments&assignment_id={assignment_id}
 * 
 * Query Parameters:
 *   - assignment_id: The assignment ID (required)
 * 
 * Response: JSON array of comment objects
 */
function getCommentsByAssignment($db, $assignmentId) {
    if (empty($assignmentId)) {
        sendResponse(['success' => false, 'message' => 'Assignment ID is required'], 400);
    }
    
    $sql = "SELECT * FROM comments WHERE assignment_id = :assignment_id ORDER BY created_at DESC";
    $stmt = $db->prepare($sql);
    
    $stmt->bindParam(':assignment_id', $assignmentId);
    
    $stmt->execute();
    
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(['success' => true, 'data' => $comments]);
}


/**
 * Function: Create a new comment
 * Method: POST
 * Endpoint: ?resource=comments
 * 
 * Required JSON Body:
 *   - assignment_id: Assignment ID (required)
 *   - author: Comment author name (required)
 *   - text: Comment content (required)
 * 
 * Response: JSON object with created comment data
 */
function createComment($db, $data) {
    if (empty($data['assignment_id']) || empty($data['author']) || empty($data['text'])) {
        sendResponse(['success' => false, 'message' => 'Assignment ID, author, and text are required'], 400);
    }
    
    $assignmentId = sanitizeInput($data['assignment_id']);
    $author = sanitizeInput($data['author']);
    $text = sanitizeInput($data['text']);
    
    if (empty(trim($text))) {
        sendResponse(['success' => false, 'message' => 'Comment text cannot be empty'], 400);
    }
    
    $stmt = $db->prepare("SELECT id FROM assignments WHERE id = :id");
    $stmt->bindParam(':id', $assignmentId);
    $stmt->execute();
    if ($stmt->rowCount() === 0) {
        sendResponse(['success' => false, 'message' => 'Assignment not found'], 404);
    }
    
    $sql = "INSERT INTO comments (assignment_id, author, text, created_at) VALUES (:assignment_id, :author, :text, NOW())";
    $stmt = $db->prepare($sql);
    
    $stmt->bindParam(':assignment_id', $assignmentId);
    $stmt->bindParam(':author', $author);
    $stmt->bindParam(':text', $text);
    
    $stmt->execute();
    
    $commentId = $db->lastInsertId();
    
    sendResponse(['success' => true, 'message' => 'Comment created successfully', 'data' => ['id' => $commentId, 'assignment_id' => $assignmentId, 'author' => $author, 'text' => $text]], 201);
}


/**
 * Function: Delete a comment
 * Method: DELETE
 * Endpoint: ?resource=comments&id={comment_id}
 * 
 * Query Parameters:
 *   - id: Comment ID (required)
 * 
 * Response: JSON object with success status
 */
function deleteComment($db, $commentId) {
    if (empty($commentId)) {
        sendResponse(['success' => false, 'message' => 'Comment ID is required'], 400);
    }
    
    $stmt = $db->prepare("SELECT id FROM comments WHERE id = :id");
    $stmt->bindParam(':id', $commentId);
    $stmt->execute();
    if ($stmt->rowCount() === 0) {
        sendResponse(['success' => false, 'message' => 'Comment not found'], 404);
    }
    
    $sql = "DELETE FROM comments WHERE id = :id";
    $stmt = $db->prepare($sql);
    
    $stmt->bindParam(':id', $commentId);
    
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        sendResponse(['success' => true, 'message' => 'Comment deleted successfully']);
    }
    
    sendResponse(['success' => false, 'message' => 'Failed to delete comment'], 500);
}


// ============================================================================
// MAIN REQUEST ROUTER
// ============================================================================

try {
    $resource = isset($_GET['resource']) ? $_GET['resource'] : null;
    
    if (!$resource) {
        sendResponse(['success' => false, 'message' => 'Resource parameter is required'], 400);
    }
    
    if ($method === 'GET') {
        if ($resource === 'assignments') {
            if (isset($_GET['id'])) {
                getAssignmentById($db, $_GET['id']);
            } else {
                getAllAssignments($db);
            }
        } elseif ($resource === 'comments') {
            if (isset($_GET['assignment_id'])) {
                getCommentsByAssignment($db, $_GET['assignment_id']);
            } else {
                sendResponse(['success' => false, 'message' => 'Assignment ID is required for comments'], 400);
            }
        } else {
            sendResponse(['success' => false, 'message' => 'Invalid resource'], 400);
        }
        
    } elseif ($method === 'POST') {
        if ($resource === 'assignments') {
            createAssignment($db, $data);
        } elseif ($resource === 'comments') {
            createComment($db, $data);
        } else {
            sendResponse(['success' => false, 'message' => 'Invalid resource'], 400);
        }
        
    } elseif ($method === 'PUT') {
        if ($resource === 'assignments') {
            updateAssignment($db, $data);
        } else {
            sendResponse(['success' => false, 'message' => 'PUT method not supported for this resource'], 405);
        }
        
    } elseif ($method === 'DELETE') {
        if ($resource === 'assignments') {
            $id = isset($_GET['id']) ? $_GET['id'] : (isset($data['id']) ? $data['id'] : null);
            deleteAssignment($db, $id);
        } elseif ($resource === 'comments') {
            if (isset($_GET['id'])) {
                deleteComment($db, $_GET['id']);
            } else {
                sendResponse(['success' => false, 'message' => 'Comment ID is required'], 400);
            }
        } else {
            sendResponse(['success' => false, 'message' => 'Invalid resource'], 400);
        }
        
    } else {
        sendResponse(['success' => false, 'message' => 'Method not supported'], 405);
    }
    
} catch (PDOException $e) {
    sendResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
} catch (Exception $e) {
    sendResponse(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
}


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper function to send JSON response and exit
 * 
 * @param array $data - Data to send as JSON
 * @param int $statusCode - HTTP status code (default: 200)
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    
    if (!is_array($data)) {
        $data = ['data' => $data];
    }
    
    echo json_encode($data);
    
    exit();
}


/**
 * Helper function to sanitize string input
 * 
 * @param string $data - Input data to sanitize
 * @return string - Sanitized data
 */
function sanitizeInput($data) {
    $data = trim($data);
    
    $data = strip_tags($data);
    
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    
    return $data;
}


/**
 * Helper function to validate date format (YYYY-MM-DD)
 * 
 * @param string $date - Date string to validate
 * @return bool - True if valid, false otherwise
 */
function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    
    return $d && $d->format('Y-m-d') === $date;
}


/**
 * Helper function to validate allowed values (for sort fields, order, etc.)
 * 
 * @param string $value - Value to validate
 * @param array $allowedValues - Array of allowed values
 * @return bool - True if valid, false otherwise
 */
function validateAllowedValue($value, $allowedValues) {
    return in_array($value, $allowedValues, true);
}

?>
