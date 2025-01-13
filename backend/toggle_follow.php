<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

// Log incoming request
error_log('Received request to toggle_follow.php');
error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
error_log('Received input: ' . print_r($input, true));

$follower_id = isset($input['follower_id']) ? (int)$input['follower_id'] : 0;
$following_id = isset($input['following_id']) ? (int)$input['following_id'] : 0;

if (!$follower_id || !$following_id) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameters',
        'debug' => [
            'follower_id' => $follower_id,
            'following_id' => $following_id
        ]
    ]);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();

    // Check if already following
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM followers WHERE follower_id = ? AND following_id = ?");
    $stmt->bind_param("ii", $follower_id, $following_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $isFollowing = $row['count'] > 0;

    if ($isFollowing) {
        // Unfollow
        $stmt = $conn->prepare("DELETE FROM followers WHERE follower_id = ? AND following_id = ?");
        $stmt->bind_param("ii", $follower_id, $following_id);
    } else {
        // Follow
        $stmt = $conn->prepare("INSERT INTO followers (follower_id, following_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $follower_id, $following_id);
    }

    $success = $stmt->execute();
    
    if (!$success) {
        throw new Exception($stmt->error);
    }

    // Get updated follower count
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM followers WHERE following_id = ?");
    $stmt->bind_param("i", $following_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $countRow = $result->fetch_assoc();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'isFollowing' => !$isFollowing,
        'updatedCounts' => [
            'followers' => (int)$countRow['count']
        ]
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred: ' . $e->getMessage()
    ]);
}

$conn->close();
?>