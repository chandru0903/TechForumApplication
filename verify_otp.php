<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
// Database connection
require_once 'config.php';  

header("Content-Type: application/json");

// Validate input
if (!isset($_POST['email']) || !isset($_POST['otp']) || empty($_POST['email']) || empty($_POST['otp'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Email and OTP are required."
    ]);
    exit;
}

$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$otp = filter_var($_POST['otp'], FILTER_SANITIZE_NUMBER_INT);

// Validate OTP
$sql = "SELECT r.otp, r.expires_at 
        FROM password_resets r
        JOIN users u ON r.user_id = u.id
        WHERE u.email = ?
        ORDER BY r.expires_at DESC
        LIMIT 1";
        
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid OTP or email."
    ]);
    exit;
}

$data = $result->fetch_assoc();

if ($otp != $data['otp']) {
    echo json_encode([
        "status" => "error",
        "message" => "Incorrect OTP."
    ]);
    exit;
}

if (strtotime($data['expires_at']) < time()) {
    echo json_encode([
        "status" => "error",
        "message" => "OTP expired."
    ]);
    exit;
}

echo json_encode([
    "status" => "success",
    "message" => "OTP verified."
]);

$conn->close();
?>