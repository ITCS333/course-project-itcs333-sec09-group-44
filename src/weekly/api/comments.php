<?php
/**
 * Comments API Handler
 * Handles operations for week comments
 */

function handleCommentsRequest() {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            getComments();
            break;
        
        case 'POST':
            createComment();
            break;
        
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
}

/**
 * GET comments for a specific week
 */
function getComments() {
    try {
        $weekId = $_GET['week_id'] ?? null;
        
        if (!$weekId) {
            http_response_code(400);
            echo json_encode(['error' => 'week_id parameter is required']);
            return;
        }
        
        $pdo = getDBConnection();
        
        // Get comments for the specified week
        $stmt = $pdo->prepare("
            SELECT id, week_id, author, text, created_at 
            FROM comments_week 
            WHERE week_id = ? 
            ORDER BY created_at DESC
        ");
        
        $stmt->execute([$weekId]);
        $comments = $stmt->fetchAll();
        
        // Format created_at dates
        foreach ($comments as &$comment) {
            $comment['created_at'] = date('Y-m-d H:i:s', strtotime($comment['created_at']));
        }
        
        echo json_encode($comments);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * POST - Create a new comment
 */
function createComment() {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (empty($input['week_id']) || empty($input['text'])) {
            http_response_code(400);
            echo json_encode(['error' => 'week_id and text are required']);
            return;
        }
        
        $pdo = getDBConnection();
        
        // Verify the week exists
        $stmt = $pdo->prepare("SELECT id FROM weeks WHERE id = ?");
        $stmt->execute([$input['week_id']]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Week not found']);
            return;
        }
        
        // Prepare data
        $weekId = $input['week_id'];
        $author = $input['author'] ?? 'Anonymous';
        $text = $input['text'];
        
        // Insert comment
        $stmt = $pdo->prepare("
            INSERT INTO comments_week (week_id, author, text) 
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([$weekId, $author, $text]);
        
        // Get the inserted comment
        $insertedId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("
            SELECT id, week_id, author, text, created_at 
            FROM comments_week 
            WHERE id = ?
        ");
        $stmt->execute([$insertedId]);
        $comment = $stmt->fetch();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Comment posted successfully',
            'data' => $comment
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
