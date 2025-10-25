     <?php
     // --- STEP 0: ENABLE ERROR REPORTING ---
     // This is the most important step for debugging. It forces PHP to show you any errors.
     ini_set('display_errors', 1);
     ini_set('display_startup_errors', 1);
     error_reporting(E_ALL);
     
     echo "<h1>Debugging Booking Form</h1>";
 
    // --- STEP 1: CHECK IF DATA IS BEING RECEIVED ---
    echo "<h2>1. Checking POST data:</h2>";
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        echo "<pre>";
        print_r($_POST);
        echo "</pre>";
    } else {
        die("<p style='color: red;'>Error: This script was not accessed via a POST request. The form might not be configured 
      correctly.</p>");
    }
    
    // --- STEP 2: DATABASE CONNECTION ---
    echo "<h2>2. Connecting to the database:</h2>";
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "student"; // Make sure this is your correct database name
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        // Use die() to stop the script immediately if the connection fails
        die("<p style='color: red;'>Connection failed: " . $conn->connect_error . "</p>");
    } else {
        echo "<p style='color: green;'>Database connection successful!</p>";
    }
   
    // --- STEP 3: PREPARE AND EXECUTE SQL ---
    echo "<h2>3. Preparing and executing the SQL query:</h2>";
   
    // Get data from the form
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $date = $_POST['date'];
    $time = $_POST['time'];
    $guests = $_POST['guests'];
    $special_requests = $_POST['special-requests'];
   
    // Prepare the SQL statement
    $stmt = $conn->prepare("INSERT INTO bookings (name, email, phone, booking_date, booking_time, guests, special_requests) VALUES (?,
      ?, ?, ?, ?, ?, ?)");
   
    if ($stmt === false) {
        die("<p style='color: red;'>Error preparing statement: " . $conn->error . ".<br>Please check if your table and column names are
      correct.</p>");
    }
   
    // Bind parameters
    $stmt->bind_param("sssssis", $name, $email, $phone, $date, $time, $guests, $special_requests);
   
    // Execute the statement
    if ($stmt->execute()) {
        echo "<p style='color: green; font-weight: bold;'>Success! The new booking was created successfully.</p>";
        echo "<p>You can now check your 'bookings' table in phpMyAdmin.</p>";
    } else {
        echo "<p style='color: red;'>Error executing statement: " . $stmt->error . "</p>";
    }
   
    // --- STEP 4: CLOSE CONNECTION ---
    $stmt->close();
    $conn->close();
    echo "<h2>4. Process finished.</h2>";
   
    ?>