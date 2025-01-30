<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
require 'vendor/autoload.php'; // Add this line for PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


require_once 'config.php';

header("Content-Type: application/json");

// Check if email is provided
if (!isset($_POST['email']) || empty($_POST['email'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Email is required."
    ]);
    exit;
}

$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);

// Check if email exists in the database
$sql = "SELECT id FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "No account associated with this email."
    ]);
    exit;
}

// Generate OTP
$otp = random_int(100000, 999999);
$expires_at = date("Y-m-d H:i:s", strtotime("+10 minutes"));

// Save OTP in the database
$user_id = $result->fetch_assoc()['id'];
$sql = "INSERT INTO password_resets (user_id, otp, expires_at) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iisss", $user_id, $otp, $expires_at, $otp, $expires_at);
$stmt->execute();

// Send OTP via email
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'techforumdevelopers@gmail.com'; // Replace with your email
    $mail->Password = 'meuoykkovnrclsrp'; // Replace with your app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Recipients
    $mail->setFrom('techforumdevelopers@gmail.com', 'TechForum Support');
    $mail->addAddress($email);

    // Content
    $mail->isHTML(true);
$mail->Subject = 'TechForum Password Reset OTP';
$mail->Body = "Dear User,<br><br>Your One-Time Password (OTP) for resetting your password is: <strong>{$otp}</strong>.<br>This OTP is valid for the next 10 minutes.<br><br>If you did not request a password reset, please ignore this email.<br><br>Thank you,<br>The TechForum Team";

    $mail->send();
    echo json_encode([
        "status" => "success",
        "message" => "OTP sent to your email."
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "OTP sending failed. Mailer Error: {$mail->ErrorInfo}"
    ]);
}

$conn->close();
?>