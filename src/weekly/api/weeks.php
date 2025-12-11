<?php
/**
 * Weeks API Handler
 * Handles CRUD operations for weekly course content
 */

function handleWeeksRequest() {
    try {
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
    } catch (Exception $e) {
        error_log("Error in handleWeeksRequest: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}

/**
 * GET all weeks or a specific week
 */
function getWeeks() {
    try {
        $pdo = getDBConnection();

        // Check if requesting a specific week
        $weekId = isset($_GET['week_id']) ? $_GET['week_id'] : null;

        if ($weekId) {
            // Get specific week
            $stmt = $pdo->prepare("
                SELECT id, title, start_date as startDate, description, links 
                FROM weeks 
                WHERE id = ?
            ");
            $stmt->execute([$weekId]);
            $week = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($week) {
                // Decode JSON links safely
                $linksJson = $week['links'];
                $week['links'] = json_decode($linksJson, true);

                // If JSON decode failed, use empty array
                if ($week['links'] === null) {
                    $week['links'] = [];
                }

                echo json_encode($week);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Week not found']);
            }
        } else {
            // Get all weeks
            $stmt = $pdo->query("
                SELECT id, title, start_date as startDate, description, links 
                FROM weeks 
                ORDER BY start_date ASC
            ");
            $weeks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Decode JSON links for each week
            foreach ($weeks as &$week) {
                $linksJson = isset($week['links']) ? $week['links'] : '[]';
                $week['links'] = json_decode($linksJson, true);

                // If JSON decode failed, use empty array
                if ($week['links'] === null) {
                    $week['links'] = [];
                }
            }

            echo json_encode($weeks);
        }
    } catch (PDOException $e) {
        error_log("Database error in getWeeks: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        error_log("Error in getWeeks: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * POST - Create a new week
 */
function createWeek() {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        // Check for JSON errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
            return;
        }

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
        $description = isset($input['description']) ? $input['description'] : '';
        $links = json_encode(isset($input['links']) ? $input['links'] : []);

        // Insert into database
        $stmt = $pdo->prepare("
            INSERT INTO weeks (title, start_date, description, links) 
            VALUES (?, ?, ?, ?)
        ");

        $stmt->execute([$title, $startDate, $description, $links]);

        // Get the inserted ID
        $insertedId = $pdo->lastInsertId();

        // Fetch the created week
        $stmt = $pdo->prepare("
            SELECT id, title, start_date as startDate, description, links 
            FROM weeks 
            WHERE id = ?
        ");
        $stmt->execute([$insertedId]);
        $week = $stmt->fetch(PDO::FETCH_ASSOC);

        // Decode links
        $week['links'] = json_decode($week['links'], true);
        if ($week['links'] === null) {
            $week['links'] = [];
        }

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Week created successfully',
            'data' => $week
        ]);

    } catch (PDOException $e) {
        error_log("Database error in createWeek: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        error_log("Error in createWeek: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * PUT - Update an existing week
 */
function updateWeek() {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);

        // Check for JSON errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
            return;
        }

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
        $title = isset($input['title']) ? $input['title'] : '';
        $startDate = isset($input['startDate']) ? $input['startDate'] : null;
        $description = isset($input['description']) ? $input['description'] : '';
        $links = json_encode(isset($input['links']) ? $input['links'] : []);

        // Update database
        $stmt = $pdo->prepare("
            UPDATE weeks 
            SET title = ?, start_date = ?, description = ?, links = ?
            WHERE id = ?
        ");

        $stmt->execute([$title, $startDate, $description, $links, $id]);

        // Fetch the updated week
        $stmt = $pdo->prepare("
            SELECT id, title, start_date as startDate, description, links 
            FROM weeks 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        $week = $stmt->fetch(PDO::FETCH_ASSOC);

        // Decode links
        $week['links'] = json_decode($week['links'], true);
        if ($week['links'] === null) {
            $week['links'] = [];
        }

        echo json_encode([
            'success' => true,
            'message' => 'Week updated successfully',
            'data' => $week
        ]);

    } catch (PDOException $e) {
        error_log("Database error in updateWeek: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        error_log("Error in updateWeek: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * DELETE - Delete a week
 */
function deleteWeek() {
    try {
        $weekId = isset($_GET['week_id']) ? $_GET['week_id'] : null;

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
        error_log("Database error in deleteWeek: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        error_log("Error in deleteWeek: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
    }
}
?>
