<?php
include 'cafe_oder_connection.php'; // Note: check if it's 'oder' or 'order'

// Test if table exists and can insert data
$test_sql = "INSERT INTO orders (order_id, customer_name, phone, address, city, pincode, landmark, total_amount, order_date, status) 
             VALUES ('TEST-001', 'Test Name', '1234567890', 'Test Address', 'Test City', '123456', 'Test Landmark', 100.00, NOW(), 'confirmed')";

if ($conn->query($test_sql)) {
    echo "Database connection successful! Test data inserted.";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>