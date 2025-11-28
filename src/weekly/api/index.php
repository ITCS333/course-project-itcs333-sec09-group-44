<?php
/**
 * Weekly Course Breakdown API (file-backed fallback)
 *
 * This file provides a lightweight JSON-file-backed API for `weeks` and
 * `comments` so the front-end can persist changes during development.
 *
 * Supported endpoints:
 *   - GET  ?resource=weeks
 *   - GET  ?resource=weeks&week_id=<id>
 *   - POST ?resource=weeks
 *   - PUT  ?resource=weeks
 *   - DELETE ?resource=weeks&week_id=<id>
 *
 *   - GET  ?resource=comments&week_id=<id>
 *   - POST ?resource=comments
 *   - DELETE ?resource=comments&week_id=<id>&index=<n>
 */

// Basic CORS + JSON headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$WEEKS_FILE = __DIR__ . '/weeks.json';
$COMMENTS_FILE = __DIR__ . '/comments.json';

// ---------------------- helpers ----------------------
function readJsonFile(string $path) {
    if (!file_exists($path)) return null;
    $c = @file_get_contents($path);
    if ($c === false) return null;
    return json_decode($c, true);
}

function writeJsonFile(string $path, $data) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false) return false;
    return file_put_contents($path, $json, LOCK_EX) !== false;
}

function sendJson($data, int $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function sanitizeInput($val) {
    if (!is_string($val)) return $val;
    $s = trim($val);
    $s = strip_tags($s);
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

function isValidSortField($field, array $allowed) {
    return in_array($field, $allowed, true);
}

// ---------------------- weeks functions ----------------------
function getAllWeeks() {
    global $WEEKS_FILE;
    $weeks = readJsonFile($WEEKS_FILE) ?: [];

    // optional search
    $search = $_GET['search'] ?? null;
    if ($search) {
        $s = mb_strtolower($search);
        $weeks = array_values(array_filter($weeks, function($w) use ($s) {
            return mb_strpos(mb_strtolower($w['title'] ?? ''), $s) !== false
                || mb_strpos(mb_strtolower($w['description'] ?? ''), $s) !== false;
        }));
    }

    // optional sort
    $allowed = ['title', 'startDate', 'created_at'];
    $sort = $_GET['sort'] ?? 'startDate';
    $order = strtolower($_GET['order'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
    if (!isValidSortField($sort, $allowed)) $sort = 'startDate';
    usort($weeks, function($a, $b) use ($sort, $order) {
        $va = $a[$sort] ?? '';
        $vb = $b[$sort] ?? '';
        if ($va == $vb) return 0;
        $cmp = ($va < $vb) ? -1 : 1;
        return $order === 'asc' ? $cmp : -$cmp;
    });

    // ensure links is an array
    foreach ($weeks as &$w) {
        if (!isset($w['links']) || !is_array($w['links'])) $w['links'] = [];
    }

    sendJson(['success' => true, 'data' => $weeks]);
}

function getWeekById($weekId) {
    if (empty($weekId)) sendJson(['success' => false, 'error' => 'Missing week_id'], 400);
    global $WEEKS_FILE;
    $weeks = readJsonFile($WEEKS_FILE) ?: [];
    foreach ($weeks as $w) {
        if (isset($w['id']) && $w['id'] === $weekId) {
            if (!isset($w['links']) || !is_array($w['links'])) $w['links'] = [];
            sendJson(['success' => true, 'data' => $w]);
        }
    }
    sendJson(['success' => false, 'error' => 'Week not found'], 404);
}

function createWeek($data) {
    global $WEEKS_FILE;
    $title = sanitizeInput($data['title'] ?? '');
    $startDate = $data['startDate'] ?? '';
    if ($title === '' || $startDate === '') sendJson(['success' => false, 'error' => 'Missing title or startDate'], 400);
    if (!validateDate($startDate)) sendJson(['success' => false, 'error' => 'Invalid startDate (YYYY-MM-DD)'], 400);

    $weeks = readJsonFile($WEEKS_FILE) ?: [];
    $id = $data['id'] ?? 'week_' . time();
    // check duplicate id
    foreach ($weeks as $w) if (isset($w['id']) && $w['id'] === $id) sendJson(['success'=>false,'error'=>'Duplicate id'],409);

    $new = [
        'id' => $id,
        'title' => $title,
        'startDate' => $startDate,
        'description' => sanitizeInput($data['description'] ?? ''),
        'links' => is_array($data['links']) ? $data['links'] : [],
        'created_at' => date('c')
    ];
    $weeks[] = $new;
    if (!writeJsonFile($WEEKS_FILE, $weeks)) sendJson(['success'=>false,'error'=>'Failed to write weeks'],500);
    sendJson(['success'=>true,'data'=>$new],201);
}

function updateWeek($data) {
    global $WEEKS_FILE;
    $id = $data['id'] ?? null;
    if (empty($id)) sendJson(['success'=>false,'error'=>'Missing id'],400);
    $weeks = readJsonFile($WEEKS_FILE) ?: [];
    $found = false;
    foreach ($weeks as &$w) {
        if (isset($w['id']) && $w['id'] === $id) {
            if (isset($data['title'])) $w['title'] = sanitizeInput($data['title']);
            if (isset($data['startDate'])) {
                if (!validateDate($data['startDate'])) sendJson(['success'=>false,'error'=>'Invalid startDate'],400);
                $w['startDate'] = $data['startDate'];
            }
            if (isset($data['description'])) $w['description'] = sanitizeInput($data['description']);
            if (isset($data['links']) && is_array($data['links'])) $w['links'] = $data['links'];
            $w['updated_at'] = date('c');
            $found = true;
            $updated = $w;
            break;
        }
    }
    if (!$found) sendJson(['success'=>false,'error'=>'Week not found'],404);
    if (!writeJsonFile($WEEKS_FILE, $weeks)) sendJson(['success'=>false,'error'=>'Failed to write weeks'],500);
    sendJson(['success'=>true,'data'=>$updated]);
}

function deleteWeek($weekId) {
    if (empty($weekId)) sendJson(['success'=>false,'error'=>'Missing week_id'],400);
    global $WEEKS_FILE, $COMMENTS_FILE;
    $weeks = readJsonFile($WEEKS_FILE) ?: [];
    $new = [];
    $found = false;
    foreach ($weeks as $w) {
        if (isset($w['id']) && $w['id'] === $weekId) { $found = true; continue; }
        $new[] = $w;
    }
    if (!$found) sendJson(['success'=>false,'error'=>'Week not found'],404);
    if (!writeJsonFile($WEEKS_FILE, $new)) sendJson(['success'=>false,'error'=>'Failed to write weeks'],500);
    // remove comments for that week
    $comments = readJsonFile($COMMENTS_FILE) ?: [];
    if (isset($comments[$weekId])) { unset($comments[$weekId]); writeJsonFile($COMMENTS_FILE, $comments); }
    sendJson(['success'=>true,'message'=>'Week deleted']);
}

// ---------------------- comments functions ----------------------
function getCommentsByWeek($weekId) {
    if (empty($weekId)) sendJson(['success'=>false,'error'=>'Missing week_id'],400);
    global $COMMENTS_FILE;
    $comments = readJsonFile($COMMENTS_FILE) ?: [];
    $result = isset($comments[$weekId]) && is_array($comments[$weekId]) ? $comments[$weekId] : [];
    sendJson(['success'=>true,'data'=>$result]);
}

function createComment($data) {
    global $COMMENTS_FILE;
    $weekId = $data['week_id'] ?? null;
    $author = sanitizeInput($data['author'] ?? 'Student');
    $text = sanitizeInput($data['text'] ?? '');
    if (empty($weekId) || trim($text) === '') sendJson(['success'=>false,'error'=>'Missing week_id or text'],400);
    $comments = readJsonFile($COMMENTS_FILE) ?: [];
    if (!isset($comments[$weekId]) || !is_array($comments[$weekId])) $comments[$weekId] = [];
    $new = [ 'author' => $author, 'text' => $text, 'created_at' => date('c') ];
    $comments[$weekId][] = $new;
    if (!writeJsonFile($COMMENTS_FILE, $comments)) sendJson(['success'=>false,'error'=>'Failed to write comments'],500);
    sendJson(['success'=>true,'data'=>$new],201);
}

function deleteComment($weekId, $index) {
    if ($weekId === null || $index === null) sendJson(['success'=>false,'error'=>'Missing week_id or index'],400);
    global $COMMENTS_FILE;
    $comments = readJsonFile($COMMENTS_FILE) ?: [];
    if (!isset($comments[$weekId][$index])) sendJson(['success'=>false,'error'=>'Comment not found'],404);
    array_splice($comments[$weekId], $index, 1);
    if (!writeJsonFile($COMMENTS_FILE, $comments)) sendJson(['success'=>false,'error'=>'Failed to write comments'],500);
    sendJson(['success'=>true]);
}

// ---------------------- router ----------------------
try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: [];
    $resource = $_GET['resource'] ?? 'weeks';

    if ($resource === 'weeks') {
        if ($method === 'GET') {
            if (isset($_GET['week_id'])) getWeekById($_GET['week_id']);
            getAllWeeks();
        }

        if ($method === 'POST') {
            createWeek($body ?: $_POST);
        }

        if ($method === 'PUT') {
            updateWeek($body ?: $_POST);
        }

        if ($method === 'DELETE') {
            $weekId = $_GET['week_id'] ?? ($body['id'] ?? null);
            deleteWeek($weekId);
        }
    } elseif ($resource === 'comments') {
        if ($method === 'GET') {
            $wk = $_GET['week_id'] ?? null;
            if ($wk === null) {
                // return all comments
                $all = readJsonFile($COMMENTS_FILE) ?: [];
                sendJson(['success'=>true,'data'=>$all]);
            }
            getCommentsByWeek($wk);
        }

        if ($method === 'POST') {
            createComment($body ?: $_POST);
        }

        if ($method === 'DELETE') {
            $wk = $_GET['week_id'] ?? ($body['week_id'] ?? null);
            $index = isset($_GET['index']) ? intval($_GET['index']) : (isset($body['index']) ? intval($body['index']) : null);
            deleteComment($wk, $index);
        }
    } else {
        sendJson(['success'=>false,'error'=>'Invalid resource. Use "weeks" or "comments"'],400);
    }

} catch (Exception $e) {
    error_log($e->getMessage());
    sendJson(['success'=>false,'error'=>'Server error'],500);
}

?>
