<?php
$servername = "localhost";
$username = "root"; // default XAMPP username
$password = ""; // default XAMPP password
$dbname = "class_student";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
// Set charset to utf8
$conn->set_charset("utf8mb4");

?>