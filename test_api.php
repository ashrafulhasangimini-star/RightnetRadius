<?php

echo "Testing Backend API...\n\n";

// Enable CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Test endpoints
$endpoints = [
    'http://localhost:8000/api/users',
    'http://localhost:8000/api/packages',
    'http://localhost:8000/api/admin-users',
];

foreach ($endpoints as $url) {
    echo "Testing: $url\n";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "  ❌ Error: $error\n";
    } else {
        echo "  ✓ Status: $httpCode\n";
        echo "  ✓ Response: " . substr($response, 0, 100) . "...\n";
    }
    echo "\n";
}

?>
