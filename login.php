<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

require_once "config.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode JSON input
    $data = json_decode(file_get_contents("php://input"), true);

    if ($data === null) {
        error_log('Invalid JSON input');
        echo json_encode([
            'status' => 'error', 
            'message' => 'Invalid input',
            'success' => false
        ]);
        exit;
    }

    // Validate input fields
    if (!isset($data['email']) || !isset($data['password'])) {
        error_log('Missing email or password');
        echo json_encode([
            'status' => 'error', 
            'message' => 'Email and password required',
            'success' => false
        ]);
        exit;
    }

    $email = $data['email'];
    $password = $data['password'];

    // Email validation
    $emailRegex = '/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/';
    if (!preg_match($emailRegex, $email)) {
        error_log('Invalid email format: ' . $email);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Invalid email address',
            'success' => false
        ]);
        exit;
    }

    // Prepare SQL statement
    $sql = "SELECT id, password FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        error_log('Database prepare statement error: ' . $conn->error);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Database error',
            'success' => false
        ]);
        exit;
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    $user = $result->fetch_assoc();

    // Verify user and password
    if (!$user) {
        error_log('No user found with email: ' . $email);
        echo json_encode([
            'status' => 'error', 
            'message' => 'User not found',
            'success' => false
        ]);
        exit;
    }

    if (!password_verify($password, $user['password'])) {
        error_log('Password verification failed for email: ' . $email);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Incorrect password',
            'success' => false
        ]);
        exit;
    }

    // Successful login
    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'userId' => $user['id'],
        'success' => true  // Explicitly set success flag
    ]);

    $stmt->close();
} else {
    error_log('Invalid request method');
    echo json_encode([
        'status' => 'error', 
        'message' => 'Invalid request method',
        'success' => false
    ]);
}

$conn->close();