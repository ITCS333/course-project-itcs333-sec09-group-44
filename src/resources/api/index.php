<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$dsn = "mysql:host=localhost;dbname=course;charset=utf8mb4";
$user = "root";
$pass = "";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];

// ---------------------------------------------------
// GET ALL RESOURCES
// ---------------------------------------------------
if ($method === "GET" && !isset($_GET["id"]) && !isset($_GET["action"])) {
    $stmt = $pdo->query("SELECT * FROM resources ORDER BY id DESC");
    echo json_encode(["data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ---------------------------------------------------
// GET COMMENTS FOR ONE RESOURCE
// ---------------------------------------------------
if ($method === "GET" && isset($_GET["action"]) && $_GET["action"] === "comments") {
    $id = intval($_GET["resource_id"]);

    $stmt = $pdo->prepare(
        "SELECT id, author, text, created_at 
         FROM comments_resource 
         WHERE resource_id = ? 
         ORDER BY id DESC"
    );
    $stmt->execute([$id]);

    echo json_encode(["data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ---------------------------------------------------
// POST (ADD RESOURCE)
// ---------------------------------------------------
if ($method === "POST" && !isset($_GET["action"])) {
    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare(
        "INSERT INTO resources (title, description, link)
         VALUES (?, ?, ?)"
    );
    $stmt->execute([
        $data["title"],
        $data["description"],
        $data["link"]
    ]);

    echo json_encode(["status" => "resource_created"]);
    exit;
}

// ---------------------------------------------------
// POST COMMENT
// ---------------------------------------------------
if ($method === "POST" && isset($_GET["action"]) && $_GET["action"] === "add_comment") {
    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare(
        "INSERT INTO comments_resource (resource_id, author, text)
         VALUES (?, ?, ?)"
    );

    $stmt->execute([
        $data["resource_id"],
        $data["author"],
        $data["text"]
    ]);

    echo json_encode(["status" => "comment_saved"]);
    exit;
}

// ---------------------------------------------------
// PUT (EDIT RESOURCE)
// ---------------------------------------------------
if ($method === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare(
        "UPDATE resources SET title=?, description=?, link=? WHERE id=?"
    );

    $stmt->execute([
        $data["title"],
        $data["description"],
        $data["link"],
        $data["id"]
    ]);

    echo json_encode(["status" => "updated"]);
    exit;
}

// ---------------------------------------------------
// DELETE (REMOVE RESOURCE)
// ---------------------------------------------------
if ($method === "DELETE") {
    $id = intval($_GET["id"]);
    $stmt = $pdo->prepare("DELETE FROM resources WHERE id=?");
    $stmt->execute([$id]);

    echo json_encode(["status" => "deleted"]);
    exit;
}
