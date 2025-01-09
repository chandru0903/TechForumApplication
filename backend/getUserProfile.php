<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, User-ID');

// Include database connection
require_once 'config.php';

function generateRandomUsername() {
    $adjectives = ['cool', 'awesome', 'creative', 'bright', 'clever'];
    $nouns = ['user', 'explorer', 'ninja', 'phoenix', 'warrior'];
    $adjective = $adjectives[array_rand($adjectives)];
    $noun = $nouns[array_rand($nouns)];
    $number = rand(100, 999);
    return $adjective . $noun . $number;
}

// Get user ID from the request header
$userId = $_SERVER['HTTP_USER_ID'] ?? null;

if (!$userId) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User ID not provided'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT id, username, full_name, bio
        FROM users
        WHERE id = ?
    ");
    
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'status' => 'error',
            'message' => 'User not found'
        ]);
        exit;
    }

    // Generate username if empty
    if (empty($user['username'])) {
        $username = generateRandomUsername();
        
        // Update the database with the generated username
        $updateStmt = $conn->prepare("
            UPDATE users 
            SET username = ? 
            WHERE id = ?
        ");
        $updateStmt->execute([$username, $userId]);
        
        // Use the generated username
        $user['username'] = $username;
    }

    // Process display name and username
    $displayName = !empty($user['full_name']) ? $user['full_name'] : $user['username'];
    $username = '@' . $user['username'];

    // Process bio
    $bio = !empty($user['bio']) ? substr($user['bio'], 0, 200) : "";
    if (strlen($user['bio'] ?? '') > 200) {
        $bio .= "...";
    }

    // Return a properly structured JSON response
    echo json_encode([
        'status' => 'success',
        'data' => [
            'id' => $user['id'],
            'displayName' => $displayName,
            'username' => $username,
            'bio' => $bio
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}