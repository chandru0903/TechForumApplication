<?php
// Include database connection
include 'config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    // Get user ID from request
    $userId = isset($_GET['id']) ? $_GET['id'] : null;

    if (!$userId) {
        throw new Exception('User ID is required');
    }

    // Prepare SQL statement
    $query = "SELECT id, username, full_name, email, created_at, bio, website, profile_image, posts_count, qa_count
              FROM users 
              WHERE id = ?";
    
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "i", $userId);
    mysqli_stmt_execute($stmt);
    
    // Get the result
    $result = mysqli_stmt_get_result($stmt);
    $userData = mysqli_fetch_assoc($result);

    if ($userData) {
        // If username is null, generate a random one
        if (!$userData['username']) {
            $userData['username'] = 'User' . rand(1000, 9999);
        }

        // Get followers count
        $followersQuery = "SELECT COUNT(*) as followers_count FROM followers WHERE following_id = ?";
        $followersStmt = mysqli_prepare($conn, $followersQuery);
        mysqli_stmt_bind_param($followersStmt, "i", $userId);
        mysqli_stmt_execute($followersStmt);
        $followersResult = mysqli_stmt_get_result($followersStmt);
        $followersData = mysqli_fetch_assoc($followersResult);
        
        // Get following count
        $followingQuery = "SELECT COUNT(*) as following_count FROM followers WHERE follower_id = ?";
        $followingStmt = mysqli_prepare($conn, $followingQuery);
        mysqli_stmt_bind_param($followingStmt, "i", $userId);
        mysqli_stmt_execute($followingStmt);
        $followingResult = mysqli_stmt_get_result($followingStmt);
        $followingData = mysqli_fetch_assoc($followingResult);

        // Get posts count


        // Get questions count
      

        // Add stats to user data
        $userData['stats'] = [
            'followers' => (int)$followersData['followers_count'],
            'following' => (int)$followingData['following_count'],
          
        ];

        echo json_encode([
            'success' => true,
            'data' => $userData
        ]);

        // Close all statements
        mysqli_stmt_close($followersStmt);
        mysqli_stmt_close($followingStmt);
     
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }

    // Close main statement
    mysqli_stmt_close($stmt);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error occurred',
        'error' => $e->getMessage()
    ]);
}

// Close connection if not handled in config.php
if (!isset($conn)) {
    mysqli_close($conn);
}
?>