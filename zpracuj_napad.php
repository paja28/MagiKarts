<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: index.html");
    exit;
}
if(!empty($_POST["website"])){
    echo("Děkujeme za váš nápad.");
    exit;
}
$napad = isset($_POST["napad_pole"]) ? trim($_POST["napad_pole"]) : "";

$chyba = null;

if(empty($napad)){
    $chyba = "Nápad je prázdný.";
}
else if(mb_strlen($napad)<5){
    $chyba = "Nápad je příliš malý.";
}
else if(mb_strlen($napad)>1000){
    $chyba = "Nápad je příliš dlouhý. Maximálně 1000 znaků.";
}

if($chyba){
    http_response_code(400);
    echo("Chyba při odesílání.");
    echo "<p>" . htmlspecialchars($chyba, ENT_QUOTES, 'UTF-8') . "</p>";
    echo("<a href='index.html'>Zpět na formulář</a>");
    exit;
}

$napad_bezpecny = htmlspecialchars($napad,ENT_QUOTES,"UTF-8");

$soubor = __DIR__.'/napady.json';
$data = file_exists($soubor)? json_decode(file_get_contents($soubor), true) : [];
if(!is_array($data)){
    $data = [];
}

$data[] = [
    "datum" => date("Y-m-d H:i:s"),
    "napad" => $napad_bezpecny
];


file_put_contents($soubor, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Magikarts -> Nápad odeslán</title>
</head>
<body>
    <h1>Děkujeme za nápad!</h1>
    <p>Váš nápad byl úspěšně zaznamenán.</p>
    <a href="index.html">Zpět na hlavní stránku</a>
</body>
</html>