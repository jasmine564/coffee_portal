<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Add CORS headers for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "student";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the raw POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Check if JSON decoding was successful
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
        exit;
    }
    
    // Validate required fields
    if (!isset($data['deliveryDetails']) || !isset($data['cart'])) {
        echo json_encode(["success" => false, "message" => "Missing required data"]);
        exit;
    }
    
    $delivery = $data['deliveryDetails'];
    $cart = $data['cart'];
    
    // Extract and validate delivery details
    $customer_name = $conn->real_escape_string($delivery['delivery_name'] ?? '');
    $phone = $conn->real_escape_string($delivery['delivery_phone'] ?? '');
    $address = $conn->real_escape_string($delivery['delivery_address'] ?? '');
    $city = $conn->real_escape_string($delivery['delivery_city'] ?? '');
    $pincode = $conn->real_escape_string($delivery['delivery_pincode'] ?? '');
    $landmark = $conn->real_escape_string($delivery['delivery_landmark'] ?? '');
    
    // Calculate total amount from cart
    $total_amount = 0;
    foreach ($cart as $item) {
        $total_amount += ($item['price'] * $item['quantity']);
    }
    
    // Add tax (2%)
    $tax = $total_amount * 0.02;
    $total_amount += $tax;
    
    // Validate required fields
    if (empty($customer_name) || empty($phone) || empty($address) || empty($city) || empty($pincode)) {
        echo json_encode(["success" => false, "message" => "All required fields must be filled"]);
        exit;
    }
    
    // Generate order ID
    $order_id = "BB-" . date("YmdHis") . rand(100, 999);
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Insert into orders table
        $stmt = $conn->prepare("INSERT INTO orders (order_id, customer_name, phone, address, city, pincode, landmark, total_amount, order_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        
        if ($stmt === false) {
            throw new Exception("Database error: " . $conn->error);
        }
        
        $stmt->bind_param("sssssssd", $order_id, $customer_name, $phone, $address, $city, $pincode, $landmark, $total_amount);
        
        if (!$stmt->execute()) {
            throw new Exception("Error executing order: " . $stmt->error);
        }
        $order_insert_id = $stmt->insert_id;
        $stmt->close();
        
        // Insert order items
        $item_stmt = $conn->prepare("INSERT INTO order_items (order_id, product_name, quantity, price, item_total) VALUES (?, ?, ?, ?, ?)");
        
        if ($item_stmt === false) {
            throw new Exception("Database error: " . $conn->error);
        }
        
        foreach ($cart as $item) {
            $item_total = $item['price'] * $item['quantity'];
            $item_stmt->bind_param("ssidd", $order_id, $item['name'], $item['quantity'], $item['price'], $item_total);
            
            if (!$item_stmt->execute()) {
                throw new Exception("Error inserting order items: " . $item_stmt->error);
            }
        }
        $item_stmt->close();
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            "success" => true,
            "message" => "Order placed successfully!",
            "order_id" => $order_id,
            "total_amount" => number_format($total_amount, 2)
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}

$conn->close();
?>