<?php
/**
 * Student Management API (students table)
 * Methods:
 *   GET    /api/index.php                -> list students
 *   GET    /api/index.php?student_id=ID  -> get one student
 *   POST   /api/index.php                -> create student
 *   PUT    /api/index.php                -> update student
 *   DELETE /api/index.php?student_id=ID  -> delete student
 */

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "../../../db_connect.php"; // $pdo

$method   = $_SERVER["REQUEST_METHOD"];
$rawBody  = file_get_contents("php://input");
$bodyData = $rawBody ? json_decode($rawBody, true) : [];
$query    = $_GET;

function sendResponse($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function sanitize(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, "UTF-8");
}

function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/* --------- Handlers --------- */

function getStudents(PDO $pdo): void {
    $search = isset($_GET["search"]) ? trim($_GET["search"]) : "";
    $sort   = $_GET["sort"]  ?? "name";
    $order  = $_GET["order"] ?? "asc";

    $allowedSort = ["name", "student_id", "email"];
    if (!in_array($sort, $allowedSort, true)) {
        $sort = "name";
    }

    $order = strtolower($order) === "desc" ? "DESC" : "ASC";

    $sql    = "SELECT student_id, name, email FROM students";
    $params = [];

    if ($search !== "") {
        $sql .= " WHERE name LIKE :term OR student_id LIKE :term OR email LIKE :term";
        $params[":term"] = "%" . $search . "%";
    }

    $sql .= " ORDER BY $sort $order";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    sendResponse(["success" => true, "data" => $rows]);
}

function getStudentById(PDO $pdo, string $studentId): void {
    $stmt = $pdo->prepare(
        "SELECT student_id, name, email FROM students WHERE student_id = :id"
    );
    $stmt->execute([":id" => $studentId]);
    $student = $stmt->fetch();

    if (!$student) {
        sendResponse(["success" => false, "message" => "Student not found"], 404);
    }

    sendResponse(["success" => true, "data" => $student]);
}

function createStudent(PDO $pdo, array $data): void {
    if (
        empty($data["student_id"]) ||
        empty($data["name"]) ||
        empty($data["email"]) ||
        empty($data["password"])
    ) {
        sendResponse(["success" => false, "message" => "Missing required fields"], 400);
    }

    $studentId = sanitize($data["student_id"]);
    $name      = sanitize($data["name"]);
    $email     = sanitize($data["email"]);
    $password  = $data["password"];

    if (!validateEmail($email)) {
        sendResponse(["success" => false, "message" => "Invalid email"], 400);
    }

    // Check duplicates
    $check = $pdo->prepare(
        "SELECT id FROM students WHERE student_id = :sid OR email = :email"
    );
    $check->execute([
        ":sid"   => $studentId,
        ":email" => $email,
    ]);
    if ($check->fetch()) {
        sendResponse(["success" => false, "message" => "Student already exists"], 409);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $insert = $pdo->prepare(
        "INSERT INTO students (student_id, name, email, password)
         VALUES (:sid, :name, :email, :pwd)"
    );

    $ok = $insert->execute([
        ":sid"   => $studentId,
        ":name"  => $name,
        ":email" => $email,
        ":pwd"   => $hash,
    ]);

    if ($ok) {
        sendResponse([
            "success" => true,
            "message" => "Student created",
            "data"    => [
                "student_id" => $studentId,
                "name"       => $name,
                "email"      => $email,
            ],
        ], 201);
    }

    sendResponse(["success" => false, "message" => "Insert failed"], 500);
}

function updateStudent(PDO $pdo, array $data): void {
    if (empty($data["student_id"])) {
        sendResponse(["success" => false, "message" => "student_id is required"], 400);
    }

    $studentId = sanitize($data["student_id"]);

    // Ensure student exists
    $check = $pdo->prepare(
        "SELECT id, email, student_id FROM students WHERE student_id = :sid"
    );
    $check->execute([":sid" => $studentId]);
    $existing = $check->fetch();

    if (!$existing) {
        sendResponse(["success" => false, "message" => "Student not found"], 404);
    }

    $fields = [];
    $params = [":sid" => $studentId];

    // Name
    if (isset($data["name"]) && $data["name"] !== "") {
        $fields[]         = "name = :name";
        $params[":name"]  = sanitize($data["name"]);
    }

    // Email
    if (isset($data["email"]) && $data["email"] !== "") {
        $newEmail = sanitize($data["email"]);
        if (!validateEmail($newEmail)) {
            sendResponse(["success" => false, "message" => "Invalid email"], 400);
        }

        // Check if email used by another student
        $dup = $pdo->prepare(
            "SELECT id FROM students WHERE email = :email AND student_id <> :sid"
        );
        $dup->execute([
            ":email" => $newEmail,
            ":sid"   => $studentId,
        ]);
        if ($dup->fetch()) {
            sendResponse(["success" => false, "message" => "Email already used"], 409);
        }

        $fields[]          = "email = :email";
        $params[":email"]  = $newEmail;
    }

    // Optional: change student_id
    if (isset($data["new_student_id"]) && $data["new_student_id"] !== $studentId) {
        $newId = sanitize($data["new_student_id"]);

        $dup2 = $pdo->prepare(
            "SELECT id FROM students WHERE student_id = :newId"
        );
        $dup2->execute([":newId" => $newId]);
        if ($dup2->fetch()) {
            sendResponse(["success" => false, "message" => "Student ID already used"], 409);
        }

        $fields[]            = "student_id = :newId";
        $params[":newId"]    = $newId;
    }

    if (empty($fields)) {
        sendResponse(["success" => false, "message" => "Nothing to update"], 400);
    }

    $sql = "UPDATE students SET " . implode(", ", $fields) . " WHERE student_id = :sid";
    $stmt = $pdo->prepare($sql);
    $ok   = $stmt->execute($params);

    if ($ok) {
        sendResponse(["success" => true, "message" => "Student updated"]);
    }

    sendResponse(["success" => false, "message" => "Update failed"], 500);
}

function deleteStudent(PDO $pdo, ?string $studentId): void {
    if (!$studentId) {
        sendResponse(["success" => false, "message" => "student_id is required"], 400);
    }

    $studentId = sanitize($studentId);

    $check = $pdo->prepare(
        "SELECT id FROM students WHERE student_id = :sid"
    );
    $check->execute([":sid" => $studentId]);
    if (!$check->fetch()) {
        sendResponse(["success" => false, "message" => "Student not found"], 404);
    }

    $del = $pdo->prepare("DELETE FROM students WHERE student_id = :sid");
    $ok  = $del->execute([":sid" => $studentId]);

    if ($ok) {
        sendResponse(["success" => true, "message" => "Student deleted"]);
    }

    sendResponse(["success" => false, "message" => "Delete failed"], 500);
}

/* --------- Router --------- */

try {
    switch ($method) {
        case "GET":
            if (isset($query["student_id"])) {
                getStudentById($pdo, $query["student_id"]);
            } else {
                getStudents($pdo);
            }
            break;

        case "POST":
            createStudent($pdo, $bodyData);
            break;

        case "PUT":
            updateStudent($pdo, $bodyData);
            break;

        case "DELETE":
            $studentId = $query["student_id"] ?? ($bodyData["student_id"] ?? null);
            deleteStudent($pdo, $studentId);
            break;

        default:
            sendResponse(["success" => false, "message" => "Method not allowed"], 405);
    }
} catch (PDOException $e) {
    error_log($e->getMessage());
    sendResponse(["success" => false, "message" => "Server error"], 500);
}