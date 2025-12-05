<?php
// Minimal wrapper: attempts to use PHPMailer (recommended), falls back to mail().
function load_config(){
  $env = __DIR__ . '/../config/.env.php';
  $example = __DIR__ . '/../config/.env.php.example';
  if(file_exists($env)) return include $env;
  if(file_exists($example)) return include $example;
  return [];
}

function send_mail($to, $subject, $body, $opts=[]){
  $cfg = load_config();
  // try PHPMailer
  $phpmailerPath = __DIR__ . '/../../vendor/phpmailer/src/PHPMailer.php';
  if(file_exists($phpmailerPath)){
    require_once __DIR__ . '/../../vendor/phpmailer/src/PHPMailer.php';
    require_once __DIR__ . '/../../vendor/phpmailer/src/SMTP.php';
    require_once __DIR__ . '/../../vendor/phpmailer/src/Exception.php';
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    try{
      $mail->isSMTP();
      $mail->Host = $cfg['SMTP_HOST'] ?? 'localhost';
      $mail->SMTPAuth = true;
      $mail->Username = $cfg['SMTP_USER'] ?? '';
      $mail->Password = $cfg['SMTP_PASS'] ?? '';
      $mail->SMTPSecure = isset($cfg['SMTP_SECURE']) ? $cfg['SMTP_SECURE'] : 'tls';
      $mail->Port = $cfg['SMTP_PORT'] ?? 587;
      $mail->setFrom($cfg['SMTP_FROM'] ?? $cfg['SMTP_USER'] ?? 'noreply@example.com');
      $mail->addAddress($to);
      $mail->isHTML(true);
      $mail->Subject = $subject;
      $mail->Body = $body;
      $mail->send();
      return true;
    } catch (Exception $e){
      // if PHPMailer fails, fall back to mail()
      error_log('PHPMailer error: ' . $e->getMessage());
      // allow fallback below
    }
  }
  // fallback to mail()
  $hdr = "MIME-Version: 1.0\r\nContent-type: text/html; charset=UTF-8\r\n";
  return mail($to, $subject, $body, $hdr);
}
