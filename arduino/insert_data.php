<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set the default timezone to Kuala Lumpur
date_default_timezone_set('Asia/Kuala_Lumpur');

$servername = process.env.DB_HOST; // Use localhost if MySQL is on the same server
$username = process.env.DB_USER;
$password = process.env.DB_PASSWORD;
$dbname = process.env.DB_NAME;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Set the timezone in MySQL to Kuala Lumpur
$conn->query("SET time_zone='+08:00'");

// Get data from the POST request
$temperature = $_POST['temperature'];
$humidity = $_POST['humidity'];
$light_intensity = $_POST['light_intensity'];

// Insert data into the database
$sql = "INSERT INTO environment_data (timestamp, temperature, humidity, light_intensity) VALUES (NOW(), $temperature, $>if ($conn->query($sql) === TRUE) {
  echo "New record created successfully";
} else {
  echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>