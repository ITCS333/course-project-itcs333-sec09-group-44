<?php
/**
 * Database Configuration with detailed error reporting
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

define('DB_HOST', 'localhost');
define('DB_NAME', 'course');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;

    } catch (PDOException $e) {
        // Log the actual error
        error_log("Database Connection Error: " . $e->getMessage());

        // Return detailed error (for debugging - remove in production)
        http_response_code(500);
        echo json_encode([
            'error' => 'Database connection failed',
            'details' => $e->getMessage(),
            'code' => $e->getCode()
        ]);
        exit;
    }
}
?>
