<?php
function data_path($name){
  return realpath(__DIR__ . '/../../../data') . DIRECTORY_SEPARATOR . $name;
}

function read_json_file($filename){
  $path = data_path($filename);
  if(!file_exists($path)) return [];
  $fp = fopen($path,'r'); if(!$fp) return [];
  flock($fp, LOCK_SH);
  $content = stream_get_contents($fp);
  flock($fp, LOCK_UN); fclose($fp);
  $data = json_decode($content, true);
  return is_array($data) ? $data : [];
}

function write_json_file($filename, $data){
  $path = data_path($filename);
  $dir = dirname($path); if(!is_dir($dir)) mkdir($dir,0755,true);
  $tmp = $path . '.tmp';
  $fp = fopen($tmp,'w'); if(!$fp) return false;
  if(!flock($fp, LOCK_EX)) { fclose($fp); return false; }
  fwrite($fp, json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
  fflush($fp); flock($fp, LOCK_UN); fclose($fp);
  rename($tmp, $path);
  return true;
}
