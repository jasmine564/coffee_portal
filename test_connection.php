<?php
include 'cafe_order_connection.php';

// Test if table exists and can insert data
$test_sql = "INSERT INTO your_orders (full_name, phone_number, full_address, city, pincode, landmark) 
             VALUES ('Test Name', '1234567890', 'Test Address', 'Test City', '123456', 'Test Landmark')";

if ($conn->query($test_sql) {
    echo "Database connection successful! Test data inserted.";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>