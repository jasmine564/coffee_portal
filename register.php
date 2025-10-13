<?php
include 'db_connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fullname = trim($_POST['name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    
    // Validate passwords match
    if ($password !== $confirm_password) {
        echo "Error: Passwords do not match!";
        exit;
    }
    
    // Check if email already exists
    $check_email = "SELECT id FROM class_student WHERE email = ?";
    $stmt = $conn->prepare($check_email);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    
    if ($stmt->num_rows > 0) {
        echo "Error: Email already registered!";
        exit;
    }
    $stmt->close();
    
    // Hash password for security
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $hashed_confirm_password = password_hash($confirm_password, PASSWORD_DEFAULT);
    
    // Insert new user
    $sql = "INSERT INTO class_student (fullname, email, phone, password, confirm_password) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $fullname, $email, $phone, $hashed_password, $hashed_confirm_password);
    
    if ($stmt->execute()) {
        echo "Registration successful!";
        // Redirect to login page or show success message
    } else {
        echo "Error: " . $stmt->error;
    }
    
    $stmt->close();
    $conn->close();
}
?>