<?php
declare(strict_types=1);

function isReplit(): bool
{
    return isset($_SERVER['REPL_ID']) || 
           isset($_SERVER['REPL_SLUG']) || 
           getenv('REPLIT_DB_URL') !== false;
}

function open_db_connection(): PDO
{
    if (isReplit()) {
        // REPLIT SETTINGS
        $host     = '127.0.0.1';
        $dbname   = 'course';
        $username = 'admin';
        $password = 'password123';
        $charset  = 'utf8mb4';
    } else {
        // LOCALHOST (XAMPP) SETTINGS
        $host     = 'localhost';
        $dbname   = 'course';
        $username = 'root';
        $password = '';
        $charset  = 'utf8mb4';
    }

    $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    return new PDO($dsn, $username, $password, $options);
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $pdo = open_db_connection();
    return $pdo;
}

function getDBConnection(): PDO
{
    return db();
}
?>