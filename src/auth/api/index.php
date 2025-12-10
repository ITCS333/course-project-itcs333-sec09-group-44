<?php
/**
 * Authentication Handler for Login Form (Task 1)
 * COMPLIANCE CHECK: Matches all TODOs
 */

// --- Session Management ---
// TODO: Start a PHP session using session_start()
session_start();

// --- Set Response Headers ---
// TODO: Set the Content-Type header to 'application/json'
header('Content-Type: application/json; charset=utf-8');

// TODO: (Optional) Set CORS headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- Check Request Method ---
// TODO: Verify that the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed']);
    exit;
}

// --- Get POST Data ---
// TODO: Retrieve the raw POST data
$rawBody = file_get_contents('php://input');

// TODO: Decode the JSON data into a PHP associative array
$data = json_decode($rawBody, true);

// TODO: Extract the email and password from the decoded data
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

// TODO: Store the email and password in variables
$email = trim($data['email']);
$password = $data['password'];

// --- Server-Side Validation ---
// TODO: Validate the email format on the server side
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// TODO: Validate the password length (minimum 8 characters)
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
    exit;
}

// --- Database Connection ---
// TODO: Get the database connection using the provided function
// FIX: We must include the DB file first since it wasn't in the original structure
require_once __DIR__ . '/../../common/db.php'; 

try {
    $pdo = getDBConnection(); // Matches the function name in your TODOs

    // --- Prepare SQL Query ---
    // TODO: Write a SQL SELECT query to find the user by email
    // IMPORTANT: Use a placeholder (?) for security
    $sql = "SELECT id, name, email, password, is_admin FROM users WHERE email = ?";

    // --- Prepare the Statement ---
    // TODO: Prepare the SQL statement using the PDO prepare method
    $stmt = $pdo->prepare($sql);

    // --- Execute the Query ---
    // TODO: Execute the prepared statement with the email parameter
    $stmt->execute([$email]);

    // --- Fetch User Data ---
    // TODO: Fetch the user record from the database
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // --- Verify User Exists and Password Matches ---
    // TODO: Check if a user was found
    // TODO: If user exists, verify the password
    if ($user && password_verify($password, $user['password'])) {

        // --- Handle Successful Authentication ---
        // TODO: Store user information in session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = ($user['is_admin'] == 1) ? 'admin' : 'student';
        $_SESSION['logged_in'] = true;

        // TODO: Prepare a success response array
        $response = [
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $_SESSION['user_role'] // Helpful for frontend redirect
            ]
        ];

        // TODO: Encode the response array as JSON and echo it
        echo json_encode($response);
        exit;

    } else {
        // --- Handle Failed Authentication ---
        // TODO: Prepare an error response array
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        exit;
    }

} catch (PDOException $e) {
    // TODO: Catch PDO exceptions in the catch block
    
    // TODO: Log the error for debugging
    error_log("Database Error: " . $e->getMessage());

    // TODO: Return a generic error message to the client
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An internal server error occurred'
    ]);
    exit;
}
?>