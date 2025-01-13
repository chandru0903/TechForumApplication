<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php'; // Assuming this has your database connection

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['current_password']) || !isset($input['new_password'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    $user_id = $input['user_id'];
    $current_password = $input['current_password'];
    $new_password = $input['new_password'];

    // First get the current password hash
    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error']);
        exit;
    }

    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Execution failed']);
        exit;
    }

    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Verify current password
    if (!password_verify($current_password, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }

    // Hash the new password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

    // Update with new password
    $update_stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    if (!$update_stmt) {
        echo json_encode(['success' => false, 'message' => 'Update prepare failed']);
        exit;
    }

    $update_stmt->bind_param("si", $hashed_password, $user_id);
    
    if (!$update_stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Update failed']);
        exit;
    }

    $update_stmt->close();
    $conn->close();
    
    echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>