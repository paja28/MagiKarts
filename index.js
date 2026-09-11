document.addEventListener("DOMContentLoaded", function () {
    let pravidla = document.getElementById("pravidla");
    let tabulkaPravidel = document.getElementById("tabulka_pravidel");
    let krizek = document.getElementById("krizek");

    if (pravidla && tabulkaPravidel) {
        pravidla.addEventListener("click", function () {
            // Přepínání zobrazení (při prvním kliknutí nebo skrytém stavu zobrazí 'block')
            if (tabulkaPravidel.style.display === "none" || tabulkaPravidel.style.display === "") {
                tabulkaPravidel.style.display = "block";
            } else {
                tabulkaPravidel.style.display = "none";
            }
        });
    }

    if(krizek){
        krizek.addEventListener("click", function(){
            tabulkaPravidel.style.display = "none";
        });
    }
});

