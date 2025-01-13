<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw POST data
    $rawData = file_get_contents('php://input');
    error_log('Received data: ' . $rawData); // Debug log
    
    $data = json_decode($rawData, true);
    
    if (!$data) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON data received'
        ]);
        exit;
    }
    
    try {
        // Validate required fields
        if (!isset($data['post_id']) || !isset($data['user_id']) || !isset($data['reaction_type'])) {
            throw new Exception('Missing required fields');
        }

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
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Reaction updated successfully'
            ]);
        } else {
            throw new Exception($stmt->error);
        }
        
    } catch (Exception $e) {
        error_log('Error in post reactions: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?>