<?php
include 'db_connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    
    // Check if user exists
    $sql = "SELECT id, fullname, password FROM class_student WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id, $fullname, $hashed_password);
    
    if ($stmt->fetch()) {
        // Verify password
        if (password_verify($password, $hashed_password)) {
            // Start session and store user data
            session_start();
            $_SESSION['user_id'] = $id;
            $_SESSION['user_name'] = $fullname;
            $_SESSION['user_email'] = $email;
            
            echo "Login successful! Welcome " . $fullname;
            // Redirect to dashboard or home page
        } else {
            echo "Error: Invalid password!";
        }
    } else {
        echo "Error: Email not found!";
    }
    
    $stmt->close();
    $conn->close();
}
?>