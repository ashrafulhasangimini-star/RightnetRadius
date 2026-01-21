<?php

$db = new PDO('sqlite:database.sqlite');
$tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);

echo "✅ Database Status:\n";
echo "Total Tables: " . count($tables) . "\n\n";
echo "Tables:\n";
foreach ($tables as $table) {
    $count = $db->query("SELECT COUNT(*) FROM $table")->fetchColumn();
    echo "  - $table: $count rows\n";
}

$db = null;
?>
