<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Because api.php is inside "public" and messages.json is in "../storage/messages.json":
define('MSG_FILE', __DIR__ . '/../storage/messages.json');

if (!file_exists(MSG_FILE)) {
    file_put_contents(MSG_FILE, '[]');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['text'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid payload']);
        exit;
    }

    $messages = json_decode(file_get_contents(MSG_FILE), true);

    $messages[] = [
        'id' => uniqid(),
        'text' => $data['text'],
        'timestamp' => $data['timestamp'] ?? date('Y-m-d H:i'),
        'sender' => $data['sender'] ?? 'user'
    ];


    file_put_contents(MSG_FILE, json_encode($messages, JSON_PRETTY_PRINT));

    echo json_encode(['status' => 'ok']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $messages = json_decode(file_get_contents(MSG_FILE), true);
    echo json_encode($messages);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
