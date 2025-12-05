<?php
header('Content-Type: text/html; charset=utf-8');
require_once __DIR__ . '/../utils/storage.php';

$token = $_GET['token'] ?? '';
if(!$token){ echo "Token inválido"; exit; }

$pending = read_json_file('reviews_pending.json');
$found = null; $idx=null;
foreach($pending as $i=>$p){ if(isset($p['token']) && hash_equals($p['token'],$token)){ $found=$p; $idx=$i; break; } }
if(!$found){ echo "Token no encontrado o expirado."; exit; }
if(time() > ($found['expires'] ?? 0)){ echo "Token caducado."; exit; }

$reviews = read_json_file('reviews.json');
$found['verified']=true; unset($found['token'],$found['expires']); $reviews[] = $found;
write_json_file('reviews.json', $reviews);
array_splice($pending, $idx, 1);
write_json_file('reviews_pending.json', $pending);

echo "Reseña verificada. Gracias.";
