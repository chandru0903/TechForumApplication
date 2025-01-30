<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once 'config.php';
    
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Only GET method is allowed');
    }

    // Get user_id from query parameters
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
    if (!$user_id) {
        throw new Exception('User ID is required');
    }

    // Optional parameters
    $post_type = isset($_GET['post_type']) ? $_GET['post_type'] : 'post';

    // Main query to fetch posts with all related data
    $query = "SELECT 
        p.*,
        u.username,
        u.profile_image,
        (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.reaction_type = 'like') as likes_count,
        (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.reaction_type = 'dislike') as dislikes_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
        (SELECT GROUP_CONCAT(user_id) FROM post_bookmarks WHERE post_id = p.id) as bookmarked_by,
        (SELECT reaction_type FROM post_reactions WHERE post_id = p.id AND user_id = ?) as user_reaction,
        EXISTS(SELECT 1 FROM post_bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ? 
    AND p.post_type = ?
    ORDER BY p.created_at DESC";

    // Prepare and execute main query
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare query: " . $conn->error);
    }

    $stmt->bind_param("iiis", $user_id, $user_id, $user_id, $post_type);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute query: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $posts = [];

    while ($row = $result->fetch_assoc()) {
        // Convert bookmarked_by to array and handle null values
        $row['bookmarked_by'] = !empty($row['bookmarked_by']) ? 
            array_map('intval', explode(',', $row['bookmarked_by'])) : 
            [];
            
        // Convert numeric strings to integers
        $row['likes_count'] = (int)$row['likes_count'];
        $row['dislikes_count'] = (int)$row['dislikes_count'];
        $row['comments_count'] = (int)$row['comments_count'];
        
        $posts[] = $row;
    }

    // Send response
    echo json_encode([
        'success' => true,
        'data' => $posts
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    error_log("Posts View API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
