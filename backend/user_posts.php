<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once 'config.php';
    
    // Handle GET request for user posts
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($_GET['user_id'])) {
        $user_id = $_GET['user_id'];
        $post_type = isset($_GET['post_type']) ? $_GET['post_type'] : 'post';
        
        // Add debug logging
        error_log("Fetching posts for user_id: " . $user_id . ", post_type: " . $post_type);
        
        $query = "SELECT p.*, 
                u.username, u.profile_image,
                COUNT(DISTINCT pr_like.id) as likes_count,
                COUNT(DISTINCT pr_dislike.id) as dislikes_count,
                COUNT(DISTINCT c.id) as comments_count,
                GROUP_CONCAT(DISTINCT pb.user_id) as bookmarked_by,
                (SELECT reaction_type 
                 FROM post_reactions 
                 WHERE post_id = p.id AND user_id = ? 
                 LIMIT 1) as user_reaction,
                CASE WHEN pb2.post_id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN post_reactions pr_like ON p.id = pr_like.post_id AND pr_like.reaction_type = 'like'
            LEFT JOIN post_reactions pr_dislike ON p.id = pr_dislike.post_id AND pr_dislike.reaction_type = 'dislike'
            LEFT JOIN comments c ON p.id = c.post_id
            LEFT JOIN post_bookmarks pb ON p.id = pb.post_id
            LEFT JOIN post_bookmarks pb2 ON p.id = pb2.post_id AND pb2.user_id = ?
            WHERE p.user_id = ? AND p.post_type = ?
            GROUP BY p.id
            ORDER BY p.created_at DESC";
            
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("iiis", $user_id, $user_id, $user_id, $post_type);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $posts = [];
        
        // Add debug logging
        error_log("Query executed, found " . $result->num_rows . " rows");
        
        while ($row = $result->fetch_assoc()) {
            $row['bookmarked_by'] = $row['bookmarked_by'] ? explode(',', $row['bookmarked_by']) : [];
            $posts[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $posts
        ]);
        exit;
    }
    // Create post
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_GET['action'])) {
        $raw_data = file_get_contents('php://input');
        if (!$raw_data) {
            throw new Exception('No data received');
        }
        
        $data = json_decode($raw_data, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data: ' . json_last_error_msg());
        }
        
        // Validate required fields
        if (empty($data['user_id']) || empty($data['title']) || empty($data['description'])) {
            throw new Exception('Required fields missing: user_id, title, and description are required');
        }
        
        // Set default values and sanitize input
        $image_url = !empty($data['image_url']) ? filter_var($data['image_url'], FILTER_SANITIZE_URL) : null;
        $external_link = !empty($data['external_link']) ? filter_var($data['external_link'], FILTER_SANITIZE_URL) : null;
        $post_type = !empty($data['post_type']) ? filter_var($data['post_type'], FILTER_SANITIZE_STRING) : 'post';
        
        $stmt = $conn->prepare("INSERT INTO posts (user_id, title, description, image_url, external_link, post_type) VALUES (?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("isssss", 
            $data['user_id'],
            $data['title'],
            $data['description'],
            $image_url,
            $external_link,
            $post_type
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $post_id = $conn->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Post created successfully',
            'post_id' => $post_id
        ]);
        exit;
    }

    // Get posts (with pagination)
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($_GET['action'])) {
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 10;
        $offset = ($page - 1) * $limit;
        
        // Count total posts for pagination
        $count_query = "SELECT COUNT(*) as total FROM posts";
        $count_result = $conn->query($count_query);
        $total_posts = $count_result->fetch_assoc()['total'];
        
        $query = "SELECT p.*, 
                u.username, u.profile_image,
                COUNT(DISTINCT pr_like.id) as likes_count,
                COUNT(DISTINCT pr_dislike.id) as dislikes_count,
                COUNT(DISTINCT c.id) as comments_count,
                GROUP_CONCAT(DISTINCT pb.user_id) as bookmarked_by
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN post_reactions pr_like ON p.id = pr_like.post_id AND pr_like.reaction_type = 'like'
            LEFT JOIN post_reactions pr_dislike ON p.id = pr_dislike.post_id AND pr_dislike.reaction_type = 'dislike'
            LEFT JOIN comments c ON p.id = c.post_id
            LEFT JOIN post_bookmarks pb ON p.id = pb.post_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?";
            
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("ii", $limit, $offset);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $posts = [];
        while ($row = $result->fetch_assoc()) {
            // Convert bookmarked_by string to array
            $row['bookmarked_by'] = $row['bookmarked_by'] ? explode(',', $row['bookmarked_by']) : [];
            $posts[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $posts,
            'page' => $page,
            'limit' => $limit,
            'total_posts' => $total_posts,
            'total_pages' => ceil($total_posts / $limit)
        ]);
        exit;
    }

    // Handle post reactions (like/dislike)
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'react') {
        $raw_data = file_get_contents('php://input');
        if (!$raw_data) {
            throw new Exception('No data received');
        }
        
        $data = json_decode($raw_data, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data: ' . json_last_error_msg());
        }
        
        // Validate required fields
        if (empty($data['post_id']) || empty($data['user_id']) || empty($data['reaction_type'])) {
            throw new Exception('Required fields missing: post_id, user_id, and reaction_type are required');
        }
        
        // Validate reaction type
        if (!in_array($data['reaction_type'], ['like', 'dislike'])) {
            throw new Exception('Invalid reaction type. Must be either "like" or "dislike"');
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Check if reaction exists
            $check_stmt = $conn->prepare("SELECT id, reaction_type FROM post_reactions WHERE post_id = ? AND user_id = ?");
            $check_stmt->bind_param("ii", $data['post_id'], $data['user_id']);
            $check_stmt->execute();
            $result = $check_stmt->get_result();
            
            if ($result->num_rows > 0) {
                $existing_reaction = $result->fetch_assoc();
                if ($existing_reaction['reaction_type'] === $data['reaction_type']) {
                    // Remove reaction if same type
                    $stmt = $conn->prepare("DELETE FROM post_reactions WHERE id = ?");
                    $stmt->bind_param("i", $existing_reaction['id']);
                } else {
                    // Update reaction if different type
                    $stmt = $conn->prepare("UPDATE post_reactions SET reaction_type = ? WHERE id = ?");
                    $stmt->bind_param("si", $data['reaction_type'], $existing_reaction['id']);
                }
            } else {
                // Create new reaction
                $stmt = $conn->prepare("INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES (?, ?, ?)");
                $stmt->bind_param("iis", $data['post_id'], $data['user_id'], $data['reaction_type']);
            }
            
            if (!$stmt->execute()) {
                throw new Exception($stmt->error);
            }
            
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Reaction updated successfully'
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            throw $e;
        }
        exit;
    }

    // Handle bookmarks
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'bookmark') {
        $raw_data = file_get_contents('php://input');
        if (!$raw_data) {
            throw new Exception('No data received');
        }
        
        $data = json_decode($raw_data, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data: ' . json_last_error_msg());
        }
        
        // Validate required fields
        if (empty($data['post_id']) || empty($data['user_id'])) {
            throw new Exception('Required fields missing: post_id and user_id are required');
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Check if bookmark exists
            $check_stmt = $conn->prepare("SELECT id FROM post_bookmarks WHERE post_id = ? AND user_id = ?");
            $check_stmt->bind_param("ii", $data['post_id'], $data['user_id']);
            $check_stmt->execute();
            $result = $check_stmt->get_result();
            
            if ($result->num_rows > 0) {
                // Remove bookmark if exists
                $bookmark = $result->fetch_assoc();
                $stmt = $conn->prepare("DELETE FROM post_bookmarks WHERE id = ?");
                $stmt->bind_param("i", $bookmark['id']);
            } else {
                // Create new bookmark
                $stmt = $conn->prepare("INSERT INTO post_bookmarks (post_id, user_id) VALUES (?, ?)");
                $stmt->bind_param("ii", $data['post_id'], $data['user_id']);
            }
            
            if (!$stmt->execute()) {
                throw new Exception($stmt->error);
            }
            
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Bookmark updated successfully'
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            throw $e;
        }
        exit;
    }

} catch (Exception $e) {
    if (isset($conn) && $conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed'
        ]);
    } else {
        error_log("API Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}
