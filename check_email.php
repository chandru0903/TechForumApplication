<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

// Include the config file
require_once 'config.php';

// Response array
$response = array();

try {
    // Check if email is provided
    if (!isset($_POST['email']) || empty($_POST['email'])) {
        throw new Exception("Email is required");
    }

    // Sanitize email input
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    // Using your existing connection from config.php
    // Prepare and execute the query
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Query preparation failed");
    }

    $stmt->bind_param("s", $email);
    
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    // Check if email exists
    $exists = $row['count'] > 0;

    $response = array(
        'status' => 'success',
        'exists' => $exists,
        'message' => $exists ? 'Email already registered' : 'Email available'
    );

} catch (Exception $e) {
    $response = array(
        'status' => 'error',
        'exists' => false,
        'message' => $e->getMessage()
    );
} finally {
    // Close statement if it exists
    if (isset($stmt)) {
        $stmt->close();
    }

    // Send response
    echo json_encode($response);
}
?>