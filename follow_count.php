<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['follower_id']) || !isset($data['following_id']) || !isset($data['action'])) {
        throw new Exception('Missing required parameters');
    }

    $followerId = intval($data['follower_id']);
    $followingId = intval($data['following_id']);
    $action = $data['action'];

    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    if ($action === 'follow') {
        $stmt = $pdo->prepare("
            INSERT INTO followers (follower_id, following_id, created_at)
            VALUES (?, ?, NOW())
        ");
        $stmt->execute([$followerId, $followingId]);
    } else if ($action === 'unfollow') {
        $stmt = $pdo->prepare("
            DELETE FROM followers 
            WHERE follower_id = ? AND following_id = ?
        ");
        $stmt->execute([$followerId, $followingId]);
    } else {
        throw new Exception('Invalid action');
    }

    echo json_encode([
        'success' => true,
        'message' => $action === 'follow' ? 'Successfully followed user' : 'Successfully unfollowed user'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>