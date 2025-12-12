<?php
function getDBConnection() {
    $databaseUrl = getenv('DATABASE_URL');

    $parsed = parse_url($databaseUrl);
    $host = $parsed['host'] ?? 'localhost';
    $port = $parsed['port'] ?? 5432;
    $dbname = ltrim($parsed['path'] ?? '', '/');
    $user = $parsed['user'] ?? '';
    $pass = $parsed['pass'] ?? '';

    parse_str($parsed['query'] ?? '', $query);
    $sslmode = $query['sslmode'] ?? 'disable';

    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=$sslmode";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    return new PDO($dsn, $user, $pass, $options);
}
?>
