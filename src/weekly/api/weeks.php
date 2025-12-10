<?php
/**
 * Weeks API Handler
 * Handles CRUD operations for weekly course content
 */

function handleWeeksRequest() {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            getWeeks();
            break;
        
        case 'POST':
            createWeek();
            break;
        
        case 'PUT':
            updateWeek();
            break;
        
        case 'DELETE':
            deleteWeek();
            break;
        
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
}

/**
 * GET all weeks or a specific week
 */
function getWeeks() {
    try {
        $pdo = getDBConnection();
        
        // Check if requesting a specific week
        $weekId = $_GET['week_id'] ?? null;
        
        if ($weekId) {
            // Get specific week
            $stmt = $pdo->prepare("SELECT id, title, start_date as startDate, description, links FROM weeks WHERE id = ? ORDER BY start_date ASC");
            $stmt->execute([$weekId]);
            $week = $stmt->fetch();
            
            if ($week) {
                // Decode JSON links
                $week['links'] = json_decode($week['links'] ?? '[]', true);
                echo json_encode($week);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Week not found']);
            }
        } else {
            // Get all weeks
            $stmt = $pdo->query("SELECT id, title, start_date as startDate, description, links FROM weeks ORDER BY start_date ASC");
            $weeks = $stmt->fetchAll();
            
            // Decode JSON links for each week
            foreach ($weeks as &$week) {
                $week['links'] = json_decode($week['links'] ?? '[]', true);
            }
            
            echo json_encode($weeks);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * POST - Create a new week
 */
function createWeek() {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (empty($input['title']) || empty($input['startDate'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and start date are required']);
            return;
        }
        
        $pdo = getDBConnection();
        
        // Prepare data
        $title = $input['title'];
        $startDate = $input['startDate'];
        $description = $input['description'] ?? '';
        $links = json_encode($input['links'] ?? []);
        
        // Insert into database
        $stmt = $pdo->prepare("
            INSERT INTO weeks (title, start_date, description, links) 
            VALUES (?, ?, ?, ?)
        ");
        
        $stmt->execute([$title, $startDate, $description, $links]);
        
        // Get the inserted ID
        $insertedId = $pdo->lastInsertId();
        
        // Fetch the created week
        $stmt = $pdo->prepare("SELECT id, title, start_date as startDate, description, links FROM weeks WHERE id = ?");
        $stmt->execute([$insertedId]);
        $week = $stmt->fetch();
        $week['links'] = json_decode($week['links'] ?? '[]', true);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Week created successfully',
            'data' => $week
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * PUT - Update an existing week
 */
function updateWeek() {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (empty($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Week ID is required']);
            return;
        }
        
        $pdo = getDBConnection();
        
        // Check if week exists
        $stmt = $pdo->prepare("SELECT id FROM weeks WHERE id = ?");
        $stmt->execute([$input['id']]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Week not found']);
            return;
        }
        
        // Prepare data
        $id = $input['id'];
        $title = $input['title'] ?? '';
        $startDate = $input['startDate'] ?? null;
        $description = $input['description'] ?? '';
        $links = json_encode($input['links'] ?? []);
        
        // Update database
        $stmt = $pdo->prepare("
            UPDATE weeks 
            SET title = ?, start_date = ?, description = ?, links = ?
            WHERE id = ?
        ");
        
        $stmt->execute([$title, $startDate, $description, $links, $id]);
        
        // Fetch the updated week
        $stmt = $pdo->prepare("SELECT id, title, start_date as startDate, description, links FROM weeks WHERE id = ?");
        $stmt->execute([$id]);
        $week = $stmt->fetch();
        $week['links'] = json_decode($week['links'] ?? '[]', true);
        
        echo json_encode([
            'success' => true,
            'message' => 'Week updated successfully',
            'data' => $week
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * DELETE - Delete a week
 */
function deleteWeek() {
    try {
        $weekId = $_GET['week_id'] ?? null;
        
        if (!$weekId) {
            http_response_code(400);
            echo json_encode(['error' => 'Week ID is required']);
            return;
        }
        
        $pdo = getDBConnection();
        
        // Check if week exists
        $stmt = $pdo->prepare("SELECT id FROM weeks WHERE id = ?");
        $stmt->execute([$weekId]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Week not found']);
            return;
        }
        
        // Delete the week (cascade will delete associated comments)
        $stmt = $pdo->prepare("DELETE FROM weeks WHERE id = ?");
        $stmt->execute([$weekId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Week deleted successfully'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>