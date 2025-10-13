<?php
// Include database connection
include 'db.php';

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data and sanitize
    $delivery_name = mysqli_real_escape_string($conn, $_POST['delivery_name']);
    $delivery_phone = mysqli_real_escape_string($conn, $_POST['delivery_phone']);
    $delivery_address = mysqli_real_escape_string($conn, $_POST['delivery_address']);
    $delivery_city = mysqli_real_escape_string($conn, $_POST['delivery_city']);
    $delivery_pincode = mysqli_real_escape_string($conn, $_POST['delivery_pincode']);
    $delivery_landmark = mysqli_real_escape_string($conn, $_POST['delivery_landmark']);
    
    // Generate order ID
    $order_id = "BB-" . date("YmdHis");
    
    // Get cart total from session or form (you'll need to implement this)
    $cart_total = isset($_POST['cart_total']) ? $_POST['cart_total'] : 0;
    
    // Insert into database
    $sql = "INSERT INTO orders (order_id, customer_name, phone, address, city, pincode, landmark, total_amount, order_date) 
            VALUES ('$order_id', '$delivery_name', '$delivery_phone', '$delivery_address', '$delivery_city', '$delivery_pincode', '$delivery_landmark', '$cart_total', NOW())";
    
    if ($conn->query($sql) === TRUE) {
        // Success - redirect to confirmation page or show success message
        echo "<script>
                alert('Order placed successfully! Your Order ID is: $order_id');
                window.location.href = 'index.html';
              </script>";
    } else {
        // Error
        echo "<script>
                alert('Error placing order. Please try again.');
                window.history.back();
              </script>";
    }
    
    // Close connection
    $conn->close();
}
?>