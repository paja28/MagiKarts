let startovniCas = Date.now(); //aktualni cas v ms

function vzhled(i) {
    if (i < 10) { i = "0" + i; }
    return i;
}

function aktualniCas() {
    let nyni = Date.now();
    let rozdil = nyni - startovniCas; 
       
    let s = Math.floor((rozdil / 1000) % 60);   
    let m = Math.floor((rozdil / (60000)) % 60);    //1000 * 60
    let h = Math.floor((rozdil / (3600000)));       //1000 * 60 * 60
    let zobrazeni = vzhled(h) + ":" + vzhled(m) + ":" + vzhled(s);
    document.getElementById("stopky").innerHTML = zobrazeni;
}

setInterval(aktualniCas, 1000);