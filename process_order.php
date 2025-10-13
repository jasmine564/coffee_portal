<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include the correct connection file
include 'cafe_oder_connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and validate input data
    $full_name = trim($_POST['delivery-name']);
    $phone_number = trim($_POST['delivery-phone']);
    $full_address = trim($_POST['delivery-address']);
    $city = trim($_POST['delivery-city']);
    $pincode = trim($_POST['delivery-pincode']);
    $landmark = isset($_POST['delivery-landmark']) ? trim($_POST['delivery-landmark']) : '';

    // Validation
    $errors = [];
    
    if (empty($full_name)) {
        $errors[] = "Full name is required";
    }
    
    if (empty($phone_number) || !preg_match("/^[0-9]{10}$/", $phone_number)) {
        $errors[] = "Valid phone number is required (10 digits)";
    }
    
    if (empty($full_address)) {
        $errors[] = "Full address is required";
    }
    
    if (empty($city)) {
        $errors[] = "City is required";
    }
    
    if (empty($pincode) || !preg_match("/^[0-9]{6}$/", $pincode)) {
        $errors[] = "Valid pincode is required (6 digits)";
    }
    
    // If there are errors, return them
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(["success" => false, "errors" => $errors]);
        exit;
    }
    
    try {
        // Prepare and execute SQL statement
        $sql = "INSERT INTO your_orders (full_name, phone_number, full_address, city, pincode, landmark) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("ssssss", $full_name, $phone_number, $full_address, $city, $pincode, $landmark);
        
        if ($stmt->execute()) {
            $order_id = $stmt->insert_id;
            
            // Success response
            echo json_encode([
                "success" => true,
                "message" => "Order placed successfully!",
                "order_id" => $order_id
            ]);
        } else {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $stmt->close();
        
    } catch (Exception $e) {
        // Error response
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "errors" => ["Database error: " . $e->getMessage()]
        ]);
    }
    
    $conn->close();
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "errors" => ["Method not allowed"]]);
}
?>