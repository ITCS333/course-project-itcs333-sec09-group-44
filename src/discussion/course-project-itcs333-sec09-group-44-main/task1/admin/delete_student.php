<!--
  Task 1 – Delete Student
  Student: Ajlan Isa Ajlan Ramadhan  ID: 202303872  Group: 44
-->
<?php
session_start();
require_once "../includes/db_connect.php";

// Only admin can delete
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "admin") {
    header("Location: ../login.php");
    exit();
}

if (!isset($_GET["id"])) {
    header("Location: students.php");
    exit();
}

$id = $_GET["id"];

try {
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'student'");
    $stmt->execute([$id]);
    header("Location: students.php");
    exit();
} catch (PDOException $e) {
    die("❌ Error deleting student: " . $e->getMessage());
}
?>