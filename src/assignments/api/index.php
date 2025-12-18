<?php
/**
 * Assignment Management API
 */

session_start();
if (!isset($_SESSION['user_context'])) {
    $_SESSION['user_context'] = ['role' => 'guest', 'initialized_at' => time()];
}

header('Content-Type: application/json');
require_once '../../common/db.php';

try {
    $db = getDBConnection();
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Auto-fix database if needed
    $check = $db->query("SELECT count(*) FROM assignments WHERE title LIKE 'HTML & CSS Portfolio%'");
    if ($check->fetchColumn() > 0) fixDatabaseData($db);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB Connection Error']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$resource = $_GET['resource'] ?? null;
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

if ($resource === 'assignments') {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT * FROM assignments WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $decoded = json_decode($row['files']);
                $row['files'] = $decoded ? $decoded : $row['files']; 
                echo json_encode(['success' => true, 'data' => $row]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Not found']);
            }
        } else {
            $stmt = $db->query("SELECT * FROM assignments ORDER BY id ASC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach($rows as &$r) {
                $decoded = json_decode($r['files']);
                $r['files'] = $decoded ? $decoded : $r['files'];
            }
            echo json_encode(['success' => true, 'data' => $rows]);
        }
    } 
    // --- CREATE (POST) ---
    elseif ($method === 'POST') {
        $title = trim($data['title'] ?? '');
        $desc = trim($data['description'] ?? '');
        $due = trim($data['due_date'] ?? '');
        // Capture files/links from JS
        $files = isset($data['files']) ? json_encode($data['files']) : json_encode([]);
        
        if (!$title || !$due) {
            echo json_encode(['success' => false, 'message' => 'Title and Due Date are required']);
            exit;
        }

        try {
            $newId = 'asg_' . time(); 
            $sql = "INSERT INTO assignments (id, title, description, due_date, files) VALUES (:id, :title, :desc, :due, :files)";
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $newId, ':title' => $title, ':desc' => $desc, ':due' => $due, ':files' => $files]);
            echo json_encode(['success' => true, 'message' => 'Assignment created', 'id' => $newId]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    // --- UPDATE (PUT) ---
    elseif ($method === 'PUT') {
        $id = $_GET['id'] ?? null;
        $title = trim($data['title'] ?? '');
        $desc = trim($data['description'] ?? '');
        $due = trim($data['due_date'] ?? '');
        $files = isset($data['files']) ? json_encode($data['files']) : json_encode([]);
        
        if (!$id) {
             echo json_encode(['success' => false, 'message' => 'Missing Assignment ID']);
             exit;
        }

        try {
            $sql = "UPDATE assignments SET title = :title, description = :desc, due_date = :due, files = :files WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $id, ':title' => $title, ':desc' => $desc, ':due' => $due, ':files' => $files]);
            echo json_encode(['success' => true, 'message' => 'Assignment updated']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    // --- DELETE ---
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $db->prepare("DELETE FROM assignments WHERE id = :id")->execute([':id' => $id]);
            echo json_encode(['success' => true]);
        }
    }

} elseif ($resource === 'comments') {
    // Comment Logic (GET/POST)
    if ($method === 'GET') {
        $stmt = $db->prepare("SELECT * FROM comments_assignment WHERE assignment_id = :id ORDER BY created_at ASC");
        $stmt->execute([':id' => $_GET['assignment_id']]);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } elseif ($method === 'POST') {
        $stmt = $db->prepare("INSERT INTO comments_assignment (assignment_id, author, text) VALUES (:aid, :auth, :txt)");
        $stmt->execute([':aid' => $data['assignment_id'], ':auth' => $data['author'], ':txt' => $data['text']]);
        echo json_encode(['success' => true]);
    }
}

// Helper Fixer
function fixDatabaseData($db) {
    try {
        $db->exec("SET FOREIGN_KEY_CHECKS=0; DELETE FROM comments_assignment; DELETE FROM assignments; SET FOREIGN_KEY_CHECKS=1;");
        $stmt = $db->prepare("INSERT INTO assignments (id, title, description, due_date, files) VALUES (:id, :title, :desc, :due, :files)");
        $stmt->execute([':id'=>'asg_1', ':title'=>'Assignment 1: HTML Basics', ':desc'=>'Create a semantic HTML...', ':due'=>'2025-11-10', ':files'=>json_encode(["portfolio.pdf"])]);
        $stmt->execute([':id'=>'asg_2', ':title'=>'Assignment 2: CSS Styling', ':desc'=>'Style your HTML...', ':due'=>'2025-11-17', ':files'=>json_encode(["style.pdf"])]);
        $stmt->execute([':id'=>'asg_3', ':title'=>'Assignment 3: JS Events', ':desc'=>'Make interactive...', ':due'=>'2025-11-24', ':files'=>json_encode(["script.js"])]);
        $db->exec("INSERT INTO comments_assignment (assignment_id, author, text) VALUES ('asg_1', 'Fatema', 'Question 1'), ('asg_2', 'Noora', 'Question 2')");
    } catch (Exception $e) {}
}
?>