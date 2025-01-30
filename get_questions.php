<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

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
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $searchQuery = isset($_GET['search']) ? $_GET['search'] : '';
    
    if (!$userId) {
        throw new Exception('User ID is required');
    }

    $query = "
        SELECT 
            p.*,
            u.username,
            u.profile_image,
            COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.reaction_type = 'like'), 0) as likes_count,
            COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id AND pr.reaction_type = 'dislike'), 0) as dislikes_count,
            COALESCE((SELECT COUNT(*) FROM post_bookmarks pb WHERE pb.post_id = p.id), 0) as bookmark_count,
            COALESCE((SELECT pr.reaction_type FROM post_reactions pr WHERE pr.post_id = p.id AND pr.user_id = :user_id LIMIT 1), NULL) as user_reaction
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.post_type = 'qa'
        " . ($searchQuery ? "AND (p.title LIKE :search OR p.description LIKE :search)" : "") . "
        ORDER BY likes_count DESC, created_at DESC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
    if ($searchQuery) {
        $stmt->bindValue(':search', '%' . $searchQuery . '%', PDO::PARAM_STR);
    }
    $stmt->execute();
    
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($questions as &$question) {
        $question['likes_count'] = (int)$question['likes_count'];
        $question['dislikes_count'] = (int)$question['dislikes_count'];
        $question['bookmark_count'] = (int)$question['bookmark_count'];
    }
    
    echo json_encode([
        'status' => 'success',
        'data' => $questions
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch questions',
        'error' => $e->getMessage()
    ]);
}
?>