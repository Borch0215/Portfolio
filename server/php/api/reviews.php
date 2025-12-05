<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../utils/storage.php';
require_once __DIR__ . '/../utils/mail.php';

function sanitize($s){ return trim(htmlspecialchars($s, ENT_QUOTES, 'UTF-8')); }

$method = $_SERVER['REQUEST_METHOD'];
if($method==='GET'){
  try{
    $reviews = read_json_file('reviews.json');
    if(!is_array($reviews)) $reviews = [];
    echo json_encode(['success'=>true,'reviews'=>$reviews]);
  } catch(Exception $e){
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Could not load reviews']);
  }
  exit;
}

if($method==='POST'){
  $body = json_decode(file_get_contents('php://input'), true);
  $name = sanitize($body['name'] ?? '');
  $email = filter_var($body['email'] ?? '', FILTER_VALIDATE_EMAIL);
  $stars = intval($body['stars'] ?? 5);
  $message = sanitize($body['message'] ?? '');
  if(!$name || !$email || !$message) { echo json_encode(['success'=>false,'error'=>'invalid']); exit; }

  $token = bin2hex(random_bytes(32));
  $entry = [
    'id'=>uniqid('r_'), 'name'=>$name,'email'=>$email,'stars'=>$stars,'message'=>$message,'token'=>$token,'expires'=>time()+86400,'created'=>time()
  ];

  $pending = read_json_file('reviews_pending.json');
  $pending[] = $entry;
  write_json_file('reviews_pending.json', $pending);

  // send verification email (safely)
  try{
    $cfgFile = __DIR__ . '/../config/.env.php';
    $cfg = (file_exists($cfgFile) ? include $cfgFile : []);
    if(!is_array($cfg)) $cfg = [];
    $base = $cfg['BASE_URL'] ?? 'http://localhost:5500/portfolio';
    $link = rtrim($base,'/') . '/server/php/api/verify_review.php?token=' . urlencode($token);
    $subject = 'Verifica tu reseña';
    $bodyHtml = "<p>Hola {$name}, gracias por tu reseña. Verifica aquí: <a href=\"{$link}\">Verificar reseña</a></p>";
    @send_mail($email, $subject, $bodyHtml);
  } catch(Exception $e){
    error_log('Email error: ' . $e->getMessage());
  }

  echo json_encode(['success'=>true,'message'=>'pending']); exit;
}

echo json_encode(['success'=>false,'error'=>'method']);
