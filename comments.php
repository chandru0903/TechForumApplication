<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php';

// Function to validate user
function validateUser($userId, $conn) {
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->num_rows > 0;
}

// Function to count total comments including replies
function getTotalComments($postId, $conn) {
    $stmt = $conn->prepare("
        SELECT COUNT(*) as total 
        FROM comments 
        WHERE post_id = ? AND post_type = 'question'
    ");
    $stmt->bind_param("i", $postId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    return $row['total'];
}

// Handle POST requests for creating/editing/deleting comments
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Create new comment
    if (isset($data['action']) && $data['action'] === 'create') {
        if (!isset($data['userId']) || !isset($data['content']) || !isset($data['postId'])) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }

        if (!validateUser($data['userId'], $conn)) {
            echo json_encode(['success' => false, 'message' => 'Invalid user']);
            exit;
        }

        $parentId = isset($data['parentId']) ? $data['parentId'] : null;
        $mentionIds = isset($data['mentionIds']) ? json_encode($data['mentionIds']) : null;
        $attachmentUrl = isset($data['attachmentUrl']) ? $data['attachmentUrl'] : null;

        $stmt = $conn->prepare("
            INSERT INTO comments 
            (user_id, parent_id, content, post_id, post_type, mention_ids, attachment_url, created_at) 
            VALUES (?, ?, ?, ?, 'question', ?, ?, NOW())
        ");

        $stmt->bind_param("iisiss", 
            $data['userId'], 
            $parentId, 
            $data['content'], 
            $data['postId'],
            $mentionIds,
            $attachmentUrl
        );

        if ($stmt->execute()) {
            $commentId = $stmt->insert_id;
            
            // Fetch the newly created comment with user details
            $stmt = $conn->prepare("
                SELECT c.*, u.username, u.profile_image 
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = ?
            ");
            $stmt->bind_param("i", $commentId);
            $stmt->execute();
            $result = $stmt->get_result();
            $comment = $result->fetch_assoc();
            
            $totalComments = getTotalComments($data['postId'], $conn);
            
            echo json_encode([
                'success' => true, 
                'comment' => $comment,
                'totalComments' => $totalComments
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to create comment']);
        }
    }
    
    // Edit comment
    else if (isset($data['action']) && $data['action'] === 'edit') {
        if (!isset($data['commentId']) || !isset($data['userId']) || !isset($data['content'])) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }

        // Verify comment ownership
        $stmt = $conn->prepare("SELECT user_id FROM comments WHERE id = ?");
        $stmt->bind_param("i", $data['commentId']);
        $stmt->execute();
        $result = $stmt->get_result();
        $comment = $result->fetch_assoc();

        if (!$comment || $comment['user_id'] != $data['userId']) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        $stmt = $conn->prepare("
            UPDATE comments 
            SET content = ?, updated_at = NOW(), is_edited = 1 
            WHERE id = ? AND user_id = ?
        ");
        
        $stmt->bind_param("sii", 
            $data['content'], 
            $data['commentId'], 
            $data['userId']
        );

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update comment']);
        }
    }
    
    // Delete comment
    else if (isset($data['action']) && $data['action'] === 'delete') {
        if (!isset($data['commentId']) || !isset($data['userId'])) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }

        // Verify comment ownership
        $stmt = $conn->prepare("SELECT user_id FROM comments WHERE id = ?");
        $stmt->bind_param("i", $data['commentId']);
        $stmt->execute();
        $result = $stmt->get_result();
        $comment = $result->fetch_assoc();

        if (!$comment || $comment['user_id'] != $data['userId']) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        // Delete comment and all its replies
        $stmt = $conn->prepare("DELETE FROM comments WHERE id = ? OR parent_id = ?");
        $stmt->bind_param("ii", $data['commentId'], $data['commentId']);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete comment']);
        }
    }
}

// Handle GET request for fetching comments
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['postId'])) {
        echo json_encode(['success' => false, 'message' => 'Missing post ID']);
        exit;
    }

    $stmt = $conn->prepare("
        WITH RECURSIVE CommentHierarchy AS (
            -- Base case: select all root comments
            SELECT 
                c.*,
                u.username,
                u.profile_image,
                0 as level
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ? 
            AND c.post_type = 'question'
            AND c.parent_id IS NULL
            
            UNION ALL
            
            -- Recursive case: select all replies
            SELECT 
                c.*,
                u.username,
                u.profile_image,
                ch.level + 1
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN CommentHierarchy ch ON c.parent_id = ch.id
        )
        SELECT * FROM CommentHierarchy
        ORDER BY 
            CASE WHEN parent_id IS NULL THEN id ELSE parent_id END,
            created_at ASC
    ");

    $stmt->bind_param("i", $_GET['postId']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $comments = [];
    $totalComments = 0;
    
    while ($row = $result->fetch_assoc()) {
        $totalComments++;
        $row['mention_ids'] = $row['mention_ids'] ? json_decode($row['mention_ids']) : [];
        
        if (!$row['parent_id']) {
            $row['replies'] = [];
            $comments[$row['id']] = $row;
        } else {
            if (isset($comments[$row['parent_id']])) {
                $comments[$row['parent_id']]['replies'][] = $row;
            }
        }
    }

    echo json_encode([
        'success' => true, 
        'comments' => array_values($comments),
        'totalComments' => $totalComments
    ]);
}

$conn->close();
?>