<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "student";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Database connected successfully!";
    
    // Check if tables exist
    $tables = ['orders', 'order_items'];
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "<br>✅ Table '$table' exists";
        } else {
            echo "<br>❌ Table '$table' missing";
        }
    }
}
$conn->close();
?>