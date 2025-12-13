<?php
// Task 1 – Database Connection
// Student: Ajlan Isa Ajlan Ramadhan  ID: 202303872  Group: 44

$host = 'localhost';
$db   = 'itcs333';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    die("❌ Database connection failed: " . $e->getMessage());
}
?>