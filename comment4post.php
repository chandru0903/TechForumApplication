<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php';

// Add error handling for database connection
if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]);
    exit;
}

// Add function to fetch comments for a post
function getCommentsForPost($postId, $conn) {
    // First get all parent comments
    $stmt = $conn->prepare("
        SELECT c.*, u.username, u.profile_image 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ? AND c.parent_id IS NULL
        ORDER BY c.created_at DESC
    ");
    
    if (!$stmt) {
        return null;
    }
    
    $stmt->bind_param("i", $postId);
    if (!$stmt->execute()) {
        return null;
    }
    
    $result = $stmt->get_result();
    $comments = [];
    
    while ($comment = $result->fetch_assoc()) {
        // Get replies for each comment
        $repliesStmt = $conn->prepare("
            SELECT c.*, u.username, u.profile_image 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.parent_id = ?
            ORDER BY c.created_at ASC
        ");
        
        if ($repliesStmt) {
            $repliesStmt->bind_param("i", $comment['id']);
            $repliesStmt->execute();
            $repliesResult = $repliesStmt->get_result();
            $comment['replies'] = [];
            
            while ($reply = $repliesResult->fetch_assoc()) {
                $comment['replies'][] = $reply;
            }
            
            $repliesStmt->close();
        }
        
        $comments[] = $comment;
    }
    
    return $comments;
}

// Handle GET request to fetch comments
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['postId'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Post ID is required'
        ]);
        exit;
    }
    
    $postId = $_GET['postId'];
    $comments = getCommentsForPost($postId, $conn);
    
    if ($comments === null) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch comments'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'comments' => $comments
        ]);
    }
    exit;
}

// Utility function to validate user
// Utility function to validate user
function validateUser($userId, $conn) {
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->num_rows > 0;
}

// Function to get comment details
function getCommentDetails($commentId, $conn) {
    $stmt = $conn->prepare("
        SELECT c.*, u.username, u.profile_image 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    ");
    $stmt->bind_param("i", $commentId);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

// Modified function to get replies - now gets all replies regardless of their original parent
function getReplies($commentId, $conn) {
    $stmt = $conn->prepare("
        SELECT c.*, u.username, u.profile_image 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE (c.parent_id = ? OR c.parent_id IN (
            SELECT id FROM comments WHERE parent_id = ?
        ))
        ORDER BY c.created_at ASC
    ");
    $stmt->bind_param("ii", $commentId, $commentId);
    $stmt->execute();
    $result = $stmt->get_result();
    $replies = [];
    while ($row = $result->fetch_assoc()) {
        $replies[] = $row;
    }
    return $replies;
}

// Handle incoming requests
$data = json_decode(file_get_contents('php://input'), true);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        if (!isset($data['userId']) || !isset($data['content']) || !isset($data['postId'])) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }

        if (!validateUser($data['userId'], $conn)) {
            echo json_encode(['success' => false, 'message' => 'Invalid user']);
            exit;
        }

        $parentId = isset($data['parentId']) ? $data['parentId'] : null;
        
        // If the parent comment is itself a reply, use its parent as the parent_id
        if ($parentId) {
            $checkParentStmt = $conn->prepare("SELECT parent_id FROM comments WHERE id = ?");
            $checkParentStmt->bind_param("i", $parentId);
            $checkParentStmt->execute();
            $parentResult = $checkParentStmt->get_result()->fetch_assoc();
            
            if ($parentResult && $parentResult['parent_id'] !== null) {
                // If replying to a reply, use the original parent comment's ID
                $parentId = $parentResult['parent_id'];
            }
        }

        $stmt = $conn->prepare("
            INSERT INTO comments (
                user_id, 
                parent_id, 
                post_id, 
                content,
                created_at
            ) VALUES (?, ?, ?, ?, NOW())
        ");

        $stmt->bind_param("iiis", 
            $data['userId'],
            $parentId,
            $data['postId'],
            $data['content']
        );

        if ($stmt->execute()) {
            $newCommentId = $stmt->insert_id;
            $comment = getCommentDetails($newCommentId, $conn);
            
            if ($parentId) {
                // If this is a reply, get the parent comment with all its replies
                $parentComment = getCommentDetails($parentId, $conn);
                $parentComment['replies'] = getReplies($parentId, $conn);
                echo json_encode([
                    'success' => true,
                    'comment' => $parentComment
                ]);
            } else {
                // If this is a new comment, return it with empty replies array
                $comment['replies'] = [];
                echo json_encode([
                    'success' => true,
                    'comment' => $comment
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create comment'
            ]);
        }
        break;

    case 'PUT':
        // Edit comment
        if (!isset($data['commentId']) || !isset($data['userId']) || !isset($data['content'])) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }

        // Verify comment ownership
        $stmt = $conn->prepare("SELECT user_id, parent_id FROM comments WHERE id = ?");
        $stmt->bind_param("i", $data['commentId']);
        $stmt->execute();
        $result = $stmt->get_result();
        $comment = $result->fetch_assoc();

        if (!$comment || $comment['user_id'] != $data['userId']) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        // Update the comment
        $stmt = $conn->prepare("
            UPDATE comments 
            SET content = ?,
                updated_at = NOW(),
                is_edited = 1
            WHERE id = ? AND user_id = ?
        ");

        $stmt->bind_param("sii", 
            $data['content'],
            $data['commentId'],
            $data['userId']
        );

        if ($stmt->execute()) {
            // Return the updated comment with its context
            if ($comment['parent_id']) {
                // If this is a reply, return the parent comment with all replies
                $parentComment = getCommentDetails($comment['parent_id'], $conn);
                $parentComment['replies'] = getReplies($comment['parent_id'], $conn);
                echo json_encode([
                    'success' => true,
                    'comment' => $parentComment
                ]);
            } else {
                // If this is a main comment, return it with its replies
                $updatedComment = getCommentDetails($data['commentId'], $conn);
                $updatedComment['replies'] = getReplies($data['commentId'], $conn);
                echo json_encode([
                    'success' => true,
                    'comment' => $updatedComment
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update comment'
            ]);
        }
        break;

    // Handle DELETE request
case 'DELETE':
    // Delete comment
    if (!isset($data['commentId']) || !isset($data['userId'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    // Verify comment ownership and get post_id
    $stmt = $conn->prepare("
        SELECT c.user_id, c.parent_id, c.post_id 
        FROM comments c
        WHERE c.id = ?
    ");
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error']);
        exit;
    }
    
    $stmt->bind_param("i", $data['commentId']);
    
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed to verify comment']);
        exit;
    }
    
    $result = $stmt->get_result();
    $comment = $result->fetch_assoc();

    if (!$comment) {
        echo json_encode(['success' => false, 'message' => 'Comment not found']);
        exit;
    }

    if ($comment['user_id'] != $data['userId']) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    // Begin transaction
    $conn->begin_transaction();

    try {
        // Delete the comment and its replies
        $deleteStmt = $conn->prepare("
            DELETE FROM comments 
            WHERE id = ? OR parent_id = ?
        ");
        
        if (!$deleteStmt) {
            throw new Exception('Failed to prepare delete statement');
        }
        
        $deleteStmt->bind_param("ii", $data['commentId'], $data['commentId']);
        
        if (!$deleteStmt->execute()) {
            throw new Exception('Failed to execute delete');
        }

        if ($comment['parent_id']) {
            // If deleted comment was a reply, get and return updated parent comment
            $parentComment = getCommentDetails($comment['parent_id'], $conn);
            if (!$parentComment) {
                throw new Exception('Failed to fetch parent comment');
            }
            $parentComment['replies'] = getReplies($comment['parent_id'], $conn);
            
            $response = [
                'success' => true,
                'comment' => $parentComment
            ];
        } else {
            // If deleted comment was a main comment
            $response = [
                'success' => true,
                'deletedId' => $data['commentId'],
                'postId' => $comment['post_id']
            ];
        }

        $conn->commit();
        echo json_encode($response);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete comment: ' . $e->getMessage()
        ]);
    }
    break;
}

$conn->close();
?>