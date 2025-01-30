<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "techforum";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Function to hash a single user's password
function hashUserPassword($conn, $email) {
    // First, get the current password
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
    if (!$stmt) {
        return ['success' => false, 'message' => 'Prepare statement failed: ' . $conn->error];
    }

    $stmt->bind_param("s", $email);
    
    if (!$stmt->execute()) {
        return ['success' => false, 'message' => 'Execution failed: ' . $stmt->error];
    }

    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ['success' => false, 'message' => 'User not found'];
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Hash the current password
    $hashed_password = password_hash($user['password'], PASSWORD_BCRYPT);

    // Update the password in the database
    $update_stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    if (!$update_stmt) {
        return ['success' => false, 'message' => 'Update prepare failed: ' . $conn->error];
    }

    $update_stmt->bind_param("si", $hashed_password, $user['id']);
    
    if (!$update_stmt->execute()) {
        return ['success' => false, 'message' => 'Update failed: ' . $update_stmt->error];
    }

    $update_stmt->close();
    
    return ['success' => true, 'message' => 'Password hashed successfully'];
}

// Check if email is provided
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email'])) {
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        exit;
    }

    $result = hashUserPassword($conn, $input['email']);
    echo json_encode($result);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$conn->close();
?>