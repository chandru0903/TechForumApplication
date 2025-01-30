<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
include 'config.php';
try {
    $logged_user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    $post_type = isset($_GET['post_type']) ? $_GET['post_type'] : 'all';

    $query = "SELECT
        p.*,
        u.username,
        u.profile_image,
        (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.reaction_type = 'like') as likes_count,
        (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.reaction_type = 'dislike') as dislikes_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.comment_type = 'comment') as comments_count,
        (SELECT GROUP_CONCAT(user_id) FROM post_bookmarks WHERE post_id = p.id) as bookmarked_by,
        (SELECT reaction_type FROM post_reactions WHERE post_id = p.id AND user_id = ?) as user_reaction,
        EXISTS(SELECT 1 FROM post_bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id";

    $params = [$logged_user_id, $logged_user_id];
    $types = "ii";
   
    if ($post_type !== 'all') {
        $query .= " WHERE p.post_type = ?";
        $params[] = $post_type;
        $types .= "s";
    }
   
    $query .= " ORDER BY p.created_at DESC";
    $stmt = $conn->prepare($query);
   
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param($types, ...$params);
   
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
   
    $result = $stmt->get_result();
    $posts = [];
   
    while ($row = $result->fetch_assoc()) {
        $row['bookmarked_by'] = !empty($row['bookmarked_by']) ?
            array_map('intval', explode(',', $row['bookmarked_by'])) :
            [];
           
        $row['likes_count'] = (int)$row['likes_count'];
        $row['dislikes_count'] = (int)$row['dislikes_count'];
        $row['comments_count'] = (int)$row['comments_count'];
        $row['is_bookmarked'] = (bool)$row['is_bookmarked'];
       
        $posts[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $posts,
        'debug' => [
            'logged_user_id' => $logged_user_id,
            'post_type' => $post_type,
            'total_posts' => count($posts)
        ]
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    error_log("Posts View API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'logged_user_id' => $logged_user_id ?? null,
            'post_type' => $post_type ?? null
        ]
    ]);
}
?>