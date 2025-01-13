<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $user_id = $_GET['user_id'];
        $post_type = isset($_GET['post_type']) ? $_GET['post_type'] : 'post'; // 'post' or 'qa'
        
        $query = "SELECT p.*, 
                  u.username, u.profile_image,
                  COUNT(DISTINCT pr_like.id) as likes_count,
                  COUNT(DISTINCT pr_dislike.id) as dislikes_count,
                  COUNT(DISTINCT c.id) as comments_count
                  FROM posts p
                  LEFT JOIN users u ON p.user_id = u.id
                  LEFT JOIN post_reactions pr_like ON p.id = pr_like.post_id AND pr_like.reaction_type = 'like'
                  LEFT JOIN post_reactions pr_dislike ON p.id = pr_dislike.post_id AND pr_dislike.reaction_type = 'dislike'
                  LEFT JOIN comments c ON p.id = c.post_id
                  WHERE p.user_id = ? AND p.post_type = ?
                  GROUP BY p.id
                  ORDER BY p.created_at DESC";
                  
        $stmt = $conn->prepare($query);
        $stmt->bind_param("is", $user_id, $post_type);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $posts = [];
        while ($row = $result->fetch_assoc()) {
            // Add additional user-specific reaction data
            $reaction_query = "SELECT reaction_type FROM post_reactions 
                             WHERE post_id = ? AND user_id = ? LIMIT 1";
            $reaction_stmt = $conn->prepare($reaction_query);
            $reaction_stmt->bind_param("ii", $row['id'], $user_id);
            $reaction_stmt->execute();
            $reaction_result = $reaction_stmt->get_result();
            $row['user_reaction'] = $reaction_result->fetch_assoc()['reaction_type'] ?? null;
            
            $posts[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $posts
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching user posts: ' . $e->getMessage()
        ]);
    }
}
?>