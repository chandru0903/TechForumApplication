<?php
$servername = "localhost"; // MySQL server, usually localhost
$username = "root"; // Your MySQL username (default is root)
$password = ""; // Your MySQL password (default is empty for localhost)
$dbname = "techforum"; // The name of your database

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}
?>