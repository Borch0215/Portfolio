<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../utils/storage.php';
require_once __DIR__ . '/../utils/mail.php';

function ip(){ return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'; }

function sanitize($s){ return trim(htmlspecialchars($s, ENT_QUOTES, 'UTF-8')); }

if($_SERVER['REQUEST_METHOD'] !== 'POST'){ echo json_encode(['success'=>false,'error'=>'method']); exit; }

$body = json_decode(file_get_contents('php://input'), true);
$name = sanitize($body['name'] ?? '');
$email = filter_var($body['email'] ?? '', FILTER_VALIDATE_EMAIL);
$subject = sanitize($body['subject'] ?? '');
$message = sanitize($body['message'] ?? '');
if(!$name || !$email || !$message){ echo json_encode(['success'=>false,'error'=>'invalid']); exit; }

// simple rate limit: 5 per hour per IP
$limits = read_json_file('rate_limits.json'); $client = ip(); $now=time();
if(!isset($limits[$client])) $limits[$client] = [];
$limits[$client] = array_filter($limits[$client], fn($t)=> $t > $now - 3600);
if(count($limits[$client]) >= 5){ echo json_encode(['success'=>false,'error'=>'rate_limited']); exit; }
$limits[$client][] = $now; write_json_file('rate_limits.json', $limits);

$entry = ['id'=>uniqid('m_'),'name'=>$name,'email'=>$email,'subject'=>$subject,'message'=>$message,'ip'=>$client,'created'=>$now];
$messages = read_json_file('messages.json'); $messages[] = $entry; write_json_file('messages.json', $messages);

// load config safely
try{
  $cfgFile = __DIR__ . '/../config/.env.php';
  $cfg = (file_exists($cfgFile) ? include $cfgFile : include __DIR__ . '/../config/.env.php.example');
  if(!is_array($cfg)) $cfg = [];
  $admin = $cfg['ADMIN_EMAIL'] ?? 'ejemplo@gmail.com';
  $bodyHtml = "<p>Nuevo mensaje de <strong>{$name}</strong> ({$email})</p><p>Asunto: {$subject}</p><p>Mensaje:</p><p>{$message}</p>";
  @send_mail($admin, 'Nuevo mensaje portfolio', $bodyHtml);
} catch(Exception $e){
  error_log('Contact email error: ' . $e->getMessage());
}

echo json_encode(['success'=>true]);
