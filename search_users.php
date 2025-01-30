<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $query = isset($_GET['query']) ? $_GET['query'] : '';
    
    if (empty($query)) {
        echo json_encode(['success' => false, 'message' => 'Search query is required']);
        exit;
    }

    // If query starts with @, remove it and search only username
    if (substr($query, 0, 1) === '@') {
        $query = substr($query, 1);
        $sql = "SELECT id, username, full_name, bio, profile_image 
                FROM users 
                WHERE username LIKE ? 
                ORDER BY CASE 
                    WHEN username = ? THEN 1
                    WHEN username LIKE ? THEN 2
                    ELSE 3
                END
                LIMIT 20";
        $searchPattern = "$query%";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sss', $query, $query, $searchPattern);
    } else {
        // Search in both username and full_name
        $sql = "SELECT id, username, full_name, bio, profile_image 
                FROM users 
                WHERE username LIKE ? OR full_name LIKE ? 
                ORDER BY CASE 
                    WHEN username = ? OR full_name = ? THEN 1
                    WHEN username LIKE ? OR full_name LIKE ? THEN 2
                    ELSE 3
                END
                LIMIT 20";
        $searchPattern = "%$query%";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ssssss', $searchPattern, $searchPattern, $query, $query, $searchPattern, $searchPattern);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $users = [];

    while ($row = $result->fetch_assoc()) {
        // Clean the profile image URL
        if ($row['profile_image']) {
            $row['profile_image'] = $row['profile_image'];
        }
        $users[] = $row;
    }

    echo json_encode([
        'success' => true,
        'users' => $users
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while searching users'
    ]);
}