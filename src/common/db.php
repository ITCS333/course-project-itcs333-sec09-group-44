<?php
// src/common/db.php
// Single place to open & reuse a PDO connection.

declare(strict_types=1);

/**
 * Actually opens a new PDO connection.
 */
function open_db_connection(): PDO
{
    $host     = 'localhost';
    $dbname   = 'course';   // MUST match the database name in phpMyAdmin
    $username = 'root';     // XAMPP default
    $password = '';         // XAMPP default: empty string
    $charset  = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    return new PDO($dsn, $username, $password, $options);
}

/**
 * Returns one shared PDO instance per request.
 */
function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $pdo = open_db_connection();
    return $pdo;
}

// ... existing code ...

/**
 * Compatibility Wrapper
 * Matches the function name requested in the Auth Template
 */
function getDBConnection(): PDO
{
    return db();
}