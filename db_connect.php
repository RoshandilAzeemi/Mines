<?php
/*
 * db_connect.php
 * Roshan Azeemi
 * March 2026
 * Shared PDO database connection for the Mines game.
 * Mines Game - CS 1XD3
 */

// ---- Database credentials (update these for your server) ----
$DB_HOST = 'localhost';
$DB_NAME = 'azeemir_db';
$DB_USER = 'azeemir_local';
$DB_PASS = '{+IRXCT9';

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo "Database connection failed. Please try again later.";
    exit;
}
?>