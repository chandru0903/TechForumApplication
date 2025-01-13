<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'];
    $profile_pic_url = null;
    
    // Handle profile picture upload
    if (isset($_FILES['profile_pictures']) && $_FILES['profile_pictures']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/profile_pictures/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $file_ext = pathinfo($_FILES['profile_pictures']['name'], PATHINFO_EXTENSION);
        $file_name = $user_id . '_' . time() . '.' . $file_ext;
        $target_path = $upload_dir . $file_name;
        
        if (move_uploaded_file($_FILES['profile_pictures']['tmp_name'], $target_path)) {
            $profile_pic_url = 'http://192.168.151.27/TechForum/backend/' . $target_path;
        } else {
            error_log("Failed to move uploaded file. Upload error code: " . $_FILES['profile_pictures']['error']);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to upload profile picture'
            ]);
            exit;
        }
    }
    
    try {
        // Start transaction
        $conn->begin_transaction();
        
        // Update profile picture if we have a new one
        if ($profile_pic_url) {
            $update_pic = "UPDATE users SET profile_image = ? WHERE id = ?";
            $stmt = $conn->prepare($update_pic);
            $stmt->bind_param('si', $profile_pic_url, $user_id);
            if (!$stmt->execute()) {
                throw new Exception("Failed to update profile picture");
            }
            $stmt->close();
        }
        
        // Update other profile information
        $update_query = "UPDATE users SET full_name = ?, username = ?, email = ?, bio = ?, website = ? WHERE id = ?";
        $stmt = $conn->prepare($update_query);
        $stmt->bind_param('sssssi', 
            $_POST['name'],
            $_POST['username'],
            $_POST['email'],
            $_POST['bio'],
            $_POST['website'],
            $user_id
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update profile information");
        }
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Profile updated successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        error_log("Profile update error: " . $e->getMessage());
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to update profile: ' . $e->getMessage()
        ]);
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
        $conn->close();
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method'
    ]);
}