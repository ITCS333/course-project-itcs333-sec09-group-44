<?php
// src/common/auth.php
// Helpers for authentication & authorization.

declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * Make sure a PHP session is active.
 */
function auth_start_session(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

/**
 * Return the current user (id, email, role) or null.
 */
function auth_current_user(): ?array
{
    auth_start_session();

    if (!isset($_SESSION['user_id'])) {
        return null;
    }

    return [
        'id'    => (int) ($_SESSION['user_id'] ?? 0),
        'email' => (string) ($_SESSION['user_email'] ?? ''),
        'role'  => (string) ($_SESSION['user_role'] ?? 'student'),
    ];
}

/**
 * True if someone is logged in.
 */
function auth_is_logged_in(): bool
{
    return auth_current_user() !== null;
}

/**
 * Current user role or null.
 */
function auth_current_role(): ?string
{
    $user = auth_current_user();
    return $user['role'] ?? null;
}

/**
 * Require any logged-in user (for APIs).
 */
function auth_require_login(): void
{
    if (!auth_is_logged_in()) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Login required.',
        ]);
        exit;
    }
}

/**
 * Require admin role (for admin APIs).
 */
function auth_require_admin(): void
{
    auth_require_login();

    if (auth_current_role() !== 'admin') {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Admin access only.',
        ]);
        exit;
    }
}

/**
 * Try to log in using email + password from the `users` table.
 * Columns: id, name, email, password, is_admin.
 */
function auth_attempt_login(string $email, string $plainPassword): bool
{
    auth_start_session();

    $pdo = db(); // from db.php

    $stmt = $pdo->prepare(
        'SELECT id, name, email, password, is_admin
         FROM users
         WHERE email = :email
         LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    $row = $stmt->fetch();

    if (!$row) {
        return false;
    }

    if (!password_verify($plainPassword, $row['password'])) {
        return false;
    }

    // Map is_admin to a simple role string
    $role = ((int) ($row['is_admin'] ?? 0) === 1) ? 'admin' : 'student';

    $_SESSION['user_id']    = (int) $row['id'];
    $_SESSION['user_email'] = $row['email'];
    $_SESSION['user_role']  = $role;
    $_SESSION['logged_in']  = true;

    return true;
}

/**
 * Log the current user out.
 */
function auth_logout(): void
{
    auth_start_session();

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    session_destroy();
}
