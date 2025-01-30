<?php
// Prevent any output before JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Include config file
require_once 'config.php';

// Validate input parameters
$userId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;
$currentUserId = isset($_GET['currentUserId']) ? (int)$_GET['currentUserId'] : null;

if (!$userId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'User ID is required'
    ]);
    exit;
}

try {
    // Get user profile information
    $query = "
    SELECT 
        u.id,
        u.username,
        u.full_name,
        u.bio,
        u.profile_image,
        u.created_at,
        u.posts_count,
        u.qa_count,
        (SELECT COUNT(*) FROM followers WHERE following_id = ?) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = ?) as following_count,
        EXISTS(
            SELECT 1 
            FROM followers 
            WHERE follower_id = ? 
            AND following_id = ?
        ) as is_following
    FROM users u
    WHERE u.id = ?
    ";
    
    // Prepare and execute the statement
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    // Bind parameters - notice we need 5 parameters now
    $stmt->bind_param("iiiii", $userId, $userId, $currentUserId, $userId, $userId);
    
    // Execute the statement
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    // Get the result
    $result = $stmt->get_result();
    $userData = $result->fetch_assoc();

    if (!$userData) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }

    $response = [
        'success' => true,
        'user' => [
            'id' => $userData['id'],
            'username' => $userData['username'],
            'full_name' => $userData['full_name'],
            'bio' => $userData['bio'] ?? '',
            'profile_image' => $userData['profile_image'] ?? '',
            'created_at' => $userData['created_at'],
            'stats' => [
                'followers' => (int)$userData['followers_count'],
                'following' => (int)$userData['following_count'],
                'posts' => (int)$userData['posts_count'],
                'qa' => (int)$userData['qa_count']
            ],
            'isFollowing' => (bool)$userData['is_following']
        ]
    ];


    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred: ' . $e->getMessage()
    ]);
}

// Close the connection
$conn->close();
?>