<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Database configuration
$host = 'localhost';
$dbname = 'techforum';
$username = 'root';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

try {
    // Get question ID from URL parameter
    $questionId = isset($_GET['questionId']) ? intval($_GET['questionId']) : null;
    
    if (!$questionId) {
        throw new Exception('Question ID is required');
    }

    // Query for question details
    $questionQuery = "
        SELECT 
            p.*,
            u.username,
            u.profile_image,
            (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id) as reaction_count,
            (SELECT COUNT(*) FROM post_bookmarks pb WHERE pb.post_id = p.id) as bookmark_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = :questionId AND p.post_type = 'qa'
    ";
    
    // Query for comments
    $commentsQuery = "
        SELECT 
            c.*,
            u.username as author_name,
            u.profile_image
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE    :questionId
        ORDER BY c.created_at DESC
    ";
    
    // Execute question query
    $stmt = $db->prepare($questionQuery);
    $stmt->execute(['questionId' => $questionId]);
    $question = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$question) {
        throw new Exception('Question not found');
    }
    
    // Execute comments query
    $stmt = $db->prepare($commentsQuery);
    $stmt->execute(['questionId' => $questionId]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Update view count
    $updateViewsQuery = "UPDATE posts SET views = views + 1 WHERE id = :questionId";
    $stmt = $db->prepare($updateViewsQuery);
    $stmt->execute(['questionId' => $questionId]);
    
    // Prepare response
    $response = [
        'status' => 'success',
        'question' => $question,
        'comments' => $comments
    ];
    
    echo json_encode($response);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>