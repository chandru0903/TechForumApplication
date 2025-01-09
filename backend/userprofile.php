<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Connect to database
require_once 'config.php';

function generateRandomUsername() {
    $adjectives = ['cool', 'awesome', 'creative', 'bright', 'clever'];
    $nouns = ['user', 'explorer', 'ninja', 'phoenix', 'warrior'];
    
    $adjective = $adjectives[array_rand($adjectives)];
    $noun = $nouns[array_rand($nouns)];
    $number = rand(100, 999);
    
    return $adjective . $noun . $number;
}

function getUserProfile() {
    global $conn;
    
    try {
        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            throw new Exception("User not authenticated");
        }
        
        $userId = $_SESSION['user_id'];
        
        $stmt = $conn->prepare("
            SELECT username, full_name, bio 
            FROM users 
            WHERE id = ?
        ");
        
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception("User not found");
        }
        
        // Process username - if empty, generate random and update database
        if (empty($user['username'])) {
            $username = generateRandomUsername();
            
            // Update the database with the generated username
            $updateStmt = $conn->prepare("
                UPDATE users 
                SET username = ? 
                WHERE id = ?
            ");
            $updateStmt->execute([$username, $userId]);
        } else {
            $username = $user['username'];
        }
        
        // Process full name
        $displayName = !empty($user['full_name']) ? $user['full_name'] : $username;
        
        // Process bio - limit to 200 characters
        $bio = !empty($user['bio']) ? substr($user['bio'], 0, 200) : "";
        if (strlen($user['bio']) > 200) {
            $bio .= "...";
        }
        
        // Prepare response
        $response = [
            'status' => 'success',
            'data' => [
                'displayName' => $displayName,
                'username' => '@' . $username,
                'bio' => $bio
            ]
        ];
        
        header('Content-Type: application/json');
        echo json_encode($response);
        
    } catch (Exception $e) {
        $response = [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
        
        header('Content-Type: application/json');
        http_response_code(401); // Unauthorized if not authenticated, or 400 for other errors
        echo json_encode($response);
    }
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    getUserProfile();
}
?>