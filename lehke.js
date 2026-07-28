// --- GLOBÁLNÍ PROMĚNNÉ ---
var je_zakliknuta_karta = false;
var zakliknuta_karta_id = null;

// ZMĚNA: Místo pevných polí s ID použijeme počítadlo. 
// Tím pádem nám nikdy nedojdou IDčka pro nové karty.
var pocitadlo_id_karet = 0;
var pocitadlo_id_abilitek = 0;

// Tyto pole už nepotřebujeme pro generování ID, ale pro sloty na stole ano:
var protihrac_prostredek_prazdne_misto = ["protihrac_pole_karta1", "protihrac_pole_karta2", "protihrac_pole_karta3", "protihrac_pole_karta4"];
var protihrac_prostredek_karty = []; // Tady budeme držet ID karet na středu

// Inventáře a pole na stole
var protihrac_inventar_objekty_karty = [];
var protihrac_prostredek_objekty_karty = [];

// Objekty
var pole_charakteru_karet = [Lucistnik, Spartan, Mag_ohne, Fireball, Kopinik, Jedovy_sip, Kusnik, Paladin, Leceni, Lecitel, Asasin, Nekromancer];

var hrac_inventar_objekty_karty = [];
var hrac_prostredek_objekty_karty = [];

var byvala_zakliknuta_karta_id = "";
var pocet_kol = 1;
var pocet_tahu = 3;
var hraje_hrac = true;

// Tahy hráče
var prvni_tah;
var druhy_tah;
var treti_tah;
var spusteni_tahu = false;

//Pro přesunutí karet
var vybrane_karty = [];
var vybrane_karty_index = 0;

//Pro útok hráče
var utocici_karty_objekty = [];
var utocici_karty_objekty_index = 0;

//Pro přidávání karet u hráč
var pomocne_pocitadlo_karet_v_inv = 0; //nemusí být správný počet karet v inventáři


var pomocne_pole_pri_healovani = [];

//Pomocné proměnnp pro protihráče
// Paměť pro tahy protihráče
var protihrac_fronta_tahu = [null, null, null];
var protihrac_orameckovane_karty_id = [];
var protihrac_inventar_pomocna_length = 0;
var protihrac_prostredek_pomocna_length = 0;
var protihrac_prvni_element_tahu_id = [];
var protihrac_druhy_element_tahu_id = [];
var index_protihrac_element_tahu = 0;

//Pamět pro počítání karet v paklíku pro hráče i protihráče
var pocet_karet_v_pakliku_hrac = 20;
var pocet_karet_v_pakliku_protihrac = 20;
var uhel_rucicky=0;
// --- HLAVNÍ FUNKCE ---

var protihrac_nekromancer_nalevo;
var protihrac_nekromancer_napravo;

var cislo_ramecku = 1;
var ramecky_k_pouziti = ["prvni_ramecek","druhy_ramecek","treti_ramecek"];

var byl_pouzit_krizek = false;
//Vygeneruje random karty na začátku tahu pro hráče a protihráče
window.onload = function () {
    // Rozdání počátečních karet
    spusteni_tahu = true;
    let hrac_dostal_jen_spell = true;
    let protihrac_dostal_jen_spell = true;
    for (let i = 0; i < 5; i++) {
        pridani_karty("hrac");
        pocet_tahu = 3; // Resetujeme tahy, protože přidání karty při startu je nebere
        pridani_karty("protihrac");

        //Kontrola toho, jestli hráč nebo protihráč dostali jenom spelly
        if (hrac_inventar_objekty_karty[i].trida != "Spell")
            hrac_dostal_jen_spell = false;
        if (protihrac_inventar_objekty_karty[i].trida != "Spell")
            protihrac_dostal_jen_spell = false;
    }
    //Pokud má hráč v inventáři jen Spelly
    if (hrac_dostal_jen_spell === true) {
        while (hrac_inventar_objekty_karty[4].trida === "Spell") {
            document.getElementById(hrac_inventar_objekty_karty[4].id).remove();
            hrac_inventar_objekty_karty.splice(4, 1);
            pridani_karty("hrac");
        }
    }
    //Pokud má protihráč v inventáři jen Spelly
    if (protihrac_dostal_jen_spell === true) {
        while (protihrac_inventar_objekty_karty[4].trida === "Spell") {
            document.getElementById(protihrac_inventar_objekty_karty[4].id).remove();
            protihrac_inventar_objekty_karty.splice(4, 1);
            pridani_karty("protihrac");
        }
    }

    spusteni_tahu = false;
    vybrane_karty_index = 0;
    cislo_ramecku=1;
    document.getElementById("kola").innerHTML = "Počet kol: " + pocet_kol;
    document.getElementById("pocitadlo_protihrac_text").innerHTML = pocet_karet_v_pakliku_protihrac;
    document.getElementById("pocitadlo_hrac_text").innerHTML = pocet_karet_v_pakliku_hrac;
}

// Pomocná funkce pro unikátní ID
function vygeneruj_nove_id() {
    pocitadlo_id_karet++;
    return "karta_" + pocitadlo_id_karet;
}

//Pro hráče
function nakliknuto(id) {
    // Pokud nehraje hráč, neměl by mít možnost klikat
    if (!hraje_hrac && pocet_tahu <= 0) return;
    
    smazani_ostatnich_fci();
    
    let karta = document.getElementById(id);
    let obal = karta.parentElement; // Rodičovský div (ten s transition)
    let prazdna_mista;

    // Pomocná funkce pro vyčištění zvýraznění plochy
    const zrusitZvyrazneniMist = () => {
        prazdna_mista = document.querySelectorAll(".prazdne_misto");
        prazdna_mista.forEach(misto => {
            misto.classList.remove("clickable");
            misto.onclick = null;
        });
    };

    // 1. SITUACE: Nic není vybráno, vybírám kartu
    if (!je_zakliknuta_karta) {
        je_zakliknuta_karta = true;
        zakliknuta_karta_id = id;

        // Vizuální zámek: Přidáme třídu na OBAL, aby karta zůstala vysunutá
        obal.classList.add("zakliknuta_v_identu");
        karta.classList.add("zakliknuta_karta");

        // Získání objektu karty
        let zakliknuta_karta_objekt = hrac_inventar_objekty_karty.find(k => k.id === id);
        
        if (zakliknuta_karta_objekt && zakliknuta_karta_objekt.trida == "Spell") {
            spell(zakliknuta_karta_objekt);
            return;
        }

        vybrane_karty[vybrane_karty_index] = zakliknuta_karta_id;

        // Zvýraznění prázdných míst
        prazdna_mista = document.querySelectorAll(".prazdne_misto");
        prazdna_mista.forEach(misto => {
            misto.classList.add("clickable");
            misto.onclick = function () { presunuti_karty(this.id); };
        });

    } else {
        // 2. SITUACE: Už je něco vybráno
        if (zakliknuta_karta_id === id) {
            // Klikl jsem na tu samou kartu -> Odznačit (Zasune se dolů)
            je_zakliknuta_karta = false;
            
            obal.classList.remove("zakliknuta_v_identu");
            karta.classList.remove("zakliknuta_karta");

            zakliknuta_karta_id = null;
            vybrane_karty[vybrane_karty_index] = null;

            zrusitZvyrazneniMist();

        } else {
            // Klikl jsem na JINOU kartu -> Přepnout výběr
            // Nejdřív "uklidíme" tu starou, aby sjela dolů
            let stara_karta = document.getElementById(zakliknuta_karta_id);
            if (stara_karta) {
                stara_karta.parentElement.classList.remove("zakliknuta_v_identu");
                stara_karta.classList.remove("zakliknuta_karta");
            }

            // Teď označíme tu novou
            zakliknuta_karta_id = id;
            obal.classList.add("zakliknuta_v_identu");
            karta.classList.add("zakliknuta_karta");

            let zakliknuta_karta_objekt = hrac_inventar_objekty_karty.find(k => k.id === id);
            
            if (zakliknuta_karta_objekt && zakliknuta_karta_objekt.trida == "Spell") {
                zrusitZvyrazneniMist();
                spell(zakliknuta_karta_objekt);
                return;
            }

            vybrane_karty[vybrane_karty_index] = zakliknuta_karta_id;
            
            // Obnovíme clickable na místech (pro jistotu)
            prazdna_mista = document.querySelectorAll(".prazdne_misto");
            prazdna_mista.forEach(misto => {
                misto.classList.add("clickable");
                misto.onclick = function () { presunuti_karty(this.id); };
            });
        }
    }
}

//Přesune karty z inventáře na střed
function presunuti_karty(id_prazdneho_mista, id_karty_pro_vykonani = null) {
    if(hraje_hrac){
        // --- HLAVNÍ OPRAVA: Zjištění správného ID ---
        // Při spuštění tahů použijeme natvrdo uložené ID z plánování
        let karta_id = spusteni_tahu ? id_karty_pro_vykonani : vybrane_karty[vybrane_karty_index];
        const presunuta_karta_element = document.getElementById(karta_id);
        const cilove_misto = document.getElementById(id_prazdneho_mista);
        let napravo_nekromancer;
        let nalevo_nekromancer;

        if (spusteni_tahu) {
            // Pojistka, kdyby element zmizel
            if (!presunuta_karta_element) {
                console.log("Karta " + karta_id + " nebyla při vykonávání nalezena.");
                vybrane_karty_index++;
                return;
            }

            // Zjištění, zda jde o nekromancera
            let postava_img = presunuta_karta_element.src.substring(presunuta_karta_element.src.length-15);
            if(postava_img == "nekromancer.png") {
                napravo_nekromancer = nekromancer_misto_napravo(cilove_misto);
                nalevo_nekromancer = nekromancer_misto_nalevo(cilove_misto);
            }

            // Smazání rámečků hned na začátku! (Bezpečnější)
            cilove_misto.classList.remove("prvni_ramecek", "druhy_ramecek", "treti_ramecek");
            presunuta_karta_element.classList.remove("prvni_ramecek", "druhy_ramecek", "treti_ramecek");

            // --- LOGIKA DAT ---
            let index_nalezene_karty = hrac_inventar_objekty_karty.findIndex(k => k.id === karta_id);

            let objekt_karty;
            if (index_nalezene_karty > -1) {
                objekt_karty = hrac_inventar_objekty_karty[index_nalezene_karty];
                hrac_prostredek_objekty_karty.push(objekt_karty);
                hrac_inventar_objekty_karty.splice(index_nalezene_karty, 1);
            } else {
                console.error("Kritická chyba: Karta s ID", karta_id, "nebyla nalezena v inventáři!");
                vybrane_karty_index++;
                return;
            }

            // --- LOGIKA ZOBRAZENÍ (DOM) ---
            presunuta_karta_element.classList.remove("zakliknuta_karta", "vysouvani_karet");
            presunuta_karta_element.parentElement.classList.remove("div_hrac_karty_najete");
            presunuta_karta_element.classList.add("clickable");

            if (objekt_karty.dmg > 0) {
                presunuta_karta_element.onclick = function () { utok(this); };
            } else {
                presunuta_karta_element.onclick = function () { healovani(this); };
            }

            let parent = presunuta_karta_element.parentElement;
            cilove_misto.appendChild(presunuta_karta_element);

            if(postava_img == "nekromancer.png") {
                nekromancer_ability(presunuta_karta_element, napravo_nekromancer, nalevo_nekromancer);
            }

            cilove_misto.classList.remove("clickable");
            cilove_misto.onclick = null;
            if (parent) parent.remove();

            let tlacitko_pridani = document.getElementById("pridavani_karet");
            if (!tlacitko_pridani.classList.contains("clickable") && pocet_karet_v_pakliku_hrac >= 0) {
                tlacitko_pridani.classList.add("clickable");
                tlacitko_pridani.onclick = function () { pridani_karty("hrac"); };
            }

            je_zakliknuta_karta = false;
            zakliknuta_karta_id = null;

            let prazdna_mista = document.querySelectorAll(".prazdne_misto");
            prazdna_mista.forEach(m => {
                m.classList.remove("clickable");
                m.onclick = null;
            });

            vybrane_karty_index++;
        }
        else {
            // --- PLÁNOVÁNÍ TAHU ---
            if (pocet_tahu > 0) {
                if (!hraje_hrac) return;
                
                if (presunuta_karta_element.classList.contains("prvni_ramecek") || presunuta_karta_element.classList.contains("druhy_ramecek") || presunuta_karta_element.classList.contains("treti_ramecek")) {
                    console.log("Karta už je používána, nejde znovu použít");
                    return;
                }
                if (cilove_misto.classList.contains("prvni_ramecek") || cilove_misto.classList.contains("druhy_ramecek") || cilove_misto.classList.contains("treti_ramecek")) {
                    console.log("Cílové místo je už používáno");
                    return;
                }
                if (cilove_misto.childElementCount > 0) {
                    console.log("Cílové místo již má kartu");
                    return;
                }

                pocet_tahu--;
                posunuti_rucicky();
                document.getElementById("text_ukazatel_tahu").innerHTML = "Počet tahů: <br>"+pocet_tahu;
                document.getElementById("konecTahu").classList.add("clickable");

                let rodic_presunute_karty_el = presunuta_karta_element.parentElement;
                rodic_presunute_karty_el.appendChild(Vytvoreni_zruseni_tahu("presunuti"));

                // OPRAVA 2: Uložení přesného ID karty pro pozdější vykonání!
                let aktualni_karta_id = presunuta_karta_element.id;

                if (prvni_tah == null) {
                    prvni_tah = presunuti_karty.bind(null, id_prazdneho_mista, aktualni_karta_id);
                } else if (druhy_tah == null) {
                    druhy_tah = presunuti_karty.bind(null, id_prazdneho_mista, aktualni_karta_id);
                } else if (treti_tah == null) {
                    treti_tah = presunuti_karty.bind(null, id_prazdneho_mista, aktualni_karta_id);
                }

                // Orámečkování z dostupného pole (bez switchů a cislo_ramecku)
                let prirazeny_ramecek = ramecky_k_pouziti.shift();
                if (prirazeny_ramecek) {
                    cilove_misto.classList.add(prirazeny_ramecek);
                    presunuta_karta_element.classList.add(prirazeny_ramecek);
                }
                else
                    console.log("Nenašel jsem rámeček k přiřazení.");

                presunuta_karta_element.classList.remove("zakliknuta_karta");
                
                // OPRAVA: Místo indexu hledáme přesně křížek podle jeho třídy
                let parent = presunuta_karta_element.parentElement;
                if (parent) {
                    let krizek_ke_smazani = parent.querySelector(".krizek");
                    if (krizek_ke_smazani) {
                        krizek_ke_smazani.remove();
                    }
                    else
                        console.log("Nenašel jsem křížek ke smazání");
                }

                let tlacitko_pridani = document.getElementById("pridavani_karet");
                if (!tlacitko_pridani.classList.contains("clickable") && pocet_karet_v_pakliku_hrac >= 0) {
                    tlacitko_pridani.classList.add("clickable");
                    tlacitko_pridani.onclick = function () { pridani_karty("hrac"); };
                }

                je_zakliknuta_karta = false;
                zakliknuta_karta_id = null;

                let prazdna_mista = document.querySelectorAll(".prazdne_misto");
                prazdna_mista.forEach(m => {
                    m.classList.remove("clickable");
                    m.onclick = null;
                });

                pomocne_pocitadlo_karet_v_inv--;
                vybrane_karty_index++;
            }
        }
    }
}


function pridani_karty(hrac_nebo_protihrac) {
    if(!hraje_hrac&&hrac_nebo_protihrac==="hrac")
    {
        console.log("Teď hraje protihráč");
        return;
    }
    //Script před spuštěním tahů
    if (hrac_nebo_protihrac === "hrac" && spusteni_tahu == false) {

        //kontrola jestli nehraje protivník
        if (!hraje_hrac) {
            console.log("Na tahu je protivník.");
            return
        }
        if (pocet_tahu > 0) {
            if (hrac_inventar_objekty_karty.length + pomocne_pocitadlo_karet_v_inv >= 5) {
                console.log("Nelze přidat více karet, nebylo by místo v inventáři");
                return;
            }
            else if (pocet_karet_v_pakliku_hrac <= 0) {
                console.log("Hráč už nemá žádné karty v paklíku karet.");
                let btn = document.getElementById("pridavani_karet");
                btn.classList.remove("clickable");
                btn.onclick = null;
                return;
            }

            //Začátek
            pocet_tahu--;
            posunuti_rucicky();
            document.getElementById("text_ukazatel_tahu").innerHTML = "Počet tahů: <br>"+pocet_tahu;
            pocet_karet_v_pakliku_hrac--;
            document.getElementById("pocitadlo_hrac_text").innerHTML = pocet_karet_v_pakliku_hrac;
            document.getElementById("konecTahu").classList.add("clickable");
            if (prvni_tah == null) {
                prvni_tah = pridani_karty.bind(null, hrac_nebo_protihrac);

            }
            else if (druhy_tah == null) {
                druhy_tah = pridani_karty.bind(null, hrac_nebo_protihrac);
            }
            else if (treti_tah == null) {
                treti_tah = pridani_karty.bind(null, hrac_nebo_protihrac);
            }

            //Odstranění bugu, s vysunutými kartami u hráče
            let hrac_vysunute_karty = document.querySelectorAll(".zakliknuta_karta");
            hrac_vysunute_karty.forEach(karta => {
                karta.classList.remove("zakliknuta_karta");
                karta.classList.add("vysouvani_karet");
                karta.parentElement.classList.add("div_hrac_karty_najete");
            })
            smazani_ostatnich_fci();
            //Odstranění bugu, s vysunutými kartami u hráče

            let btn = document.getElementById("pridavani_karet");

            //Orámečkování vybrané karty a prázdného místa
            // 1. Vezmeme první dostupný rámeček z našeho pole
            let prirazeny_ramecek = ramecky_k_pouziti.shift();
            console.log("Rámečky k použití: "+ramecky_k_pouziti);
            console.log("Přiřazený rámeček: "+prirazeny_ramecek);
            if (!prirazeny_ramecek) {
                console.log("Nejsou k dispozici žádné rámečky!");
                return;
            }

            // 2. Přiřadíme rámeček fyzicky na obrázek balíčku
            let balicek_img = document.getElementById("pridavani_karet");
            balicek_img.classList.add(prirazeny_ramecek);

            // 3. ULOŽENÍ HISTORIE: Přidáme rámeček do seznamu na balíčku
            // 3. ULOŽENÍ HISTORIE (ZCELA IMUNNÍ VŮČI DUPLIKÁTŮM)
            let historie = balicek_img.dataset.historieRamecku;
            
            if (historie) {
                let pole_historie = historie.split(",");
                
                // 1. Nejdřív z historie natvrdo vymažeme tento rámeček, pokud tam už je
                pole_historie = pole_historie.filter(r => r !== prirazeny_ramecek);
                
                // 2. A teprve pak ho přidáme bezpečně a nově na konec
                pole_historie.push(prirazeny_ramecek);
                
                // 3. Vrátíme opravenou historii zpět
                balicek_img.dataset.historieRamecku = pole_historie.join(",");
            } else {
                // Pokud je historie prázdná
                balicek_img.dataset.historieRamecku = prirazeny_ramecek;
            }

            // 4. Vytvoříme šipku POUZE POKUD TAM JEŠTĚ NENÍ
            let obal_balicku = document.getElementById("obal_pridavani_karet");
            let existujici_sipka = obal_balicku.querySelector(".zruseni_tahu");
            
            if (!existujici_sipka) {
                let tlacitko_zpet = Vytvoreni_zruseni_tahu("lizani");
                obal_balicku.appendChild(tlacitko_zpet);
            }

            //
            pomocne_pocitadlo_karet_v_inv++;
            vybrane_karty_index++;
        }
        else
            console.log("Hráč už nemá tahy.");
        return;
    }
    // Zjistíme, jestli má hráč/protihráč místo v ruce
    let inventar = (hrac_nebo_protihrac === "hrac") ? hrac_inventar_objekty_karty : protihrac_inventar_objekty_karty;

    if (inventar.length >= 5) {
        console.log(hrac_nebo_protihrac + " má plný inventář.");
        return;
    }

    // Výběr náhodné karty ze šablony
    let random_index = Math.floor(Math.random() * pole_charakteru_karet.length);
    // Vytvoření kopie objektu

    let nova_karta_objekt = structuredClone(pole_charakteru_karet[random_index]);


    // ZMĚNA: Generování nového ID
    nova_karta_objekt.id = vygeneruj_nove_id();

    // Uložení do pole objektů
    if (hrac_nebo_protihrac === "hrac") {
        hrac_inventar_objekty_karty.push(nova_karta_objekt);
    } else {
        protihrac_inventar_objekty_karty.push(nova_karta_objekt);
    }

    // Vytvoření obrázku (DOM)
    const kontejner = document.getElementById(hrac_nebo_protihrac === "hrac" ? "hracovy_karty" : "protihracovy_karty");
    const img = document.createElement("img");
    img.id = nova_karta_objekt.id;
    img.src = nova_karta_objekt.img;
    if (hrac_nebo_protihrac === "hrac")
        img.classList.add("karty");
    else
        img.classList.add("protihrac_karty");

    if (hrac_nebo_protihrac === "hrac") {
        img.classList.add("vysouvani_karet", "clickable");
        img.onclick = function () { nakliknuto(this.id); };

        // Pokud má hráč plno, vypneme tlačítko
        let btn = document.getElementById("pridavani_karet");
        if (hrac_inventar_objekty_karty.length + pomocne_pocitadlo_karet_v_inv >= 5) {
            btn.classList.remove("clickable");
            btn.onclick = null;
        }
        // Smažeme rovnou všechny rámečky nezávisle na tom, kolikátý je to tah
        btn.classList.remove("prvni_ramecek", "druhy_ramecek", "treti_ramecek");
        
        btn.removeAttribute("data-historie-ramecku");
        // =========================================================

        vybrane_karty_index++;
    }


    if(hrac_nebo_protihrac ==="hrac"){
        const div = document.createElement("div");
        div.classList.add("div_hrac_karty","div_hrac_karty_najete");
        div.appendChild(img);
        div.appendChild(Vytvoreni_krizku());
        kontejner.appendChild(div);
    }
    else{
        kontejner.appendChild(img);
    }
}

// --- LOGIKA PROTIHRÁČE ---

//Protihráč, přesunutí karty na střed, nebo využití spellu z inventáře
// Nová funkce pro fyzický přesun
function protihrac_presunuti_karty_vykonani(objekt_karty, slot_id) {
    let index = protihrac_inventar_objekty_karty.findIndex(k => k.id === objekt_karty.id);
    if (index > -1) {
        // Přesun v datech
        protihrac_inventar_objekty_karty.splice(index, 1);
        protihrac_prostredek_objekty_karty.push(objekt_karty);

        let slot_index = protihrac_prostredek_prazdne_misto.indexOf(slot_id);
        if (slot_index > -1) protihrac_prostredek_prazdne_misto.splice(slot_index, 1);

        // Přesun v grafice
        let karta_el = document.getElementById(objekt_karty.id);
        karta_el.classList.remove("vysouvani_karet_protihrace"); // pokud tam ještě zbyla
        let slot_el = document.getElementById(slot_id);
        slot_el.appendChild(karta_el);
        postava_img = karta_el.src.substring(karta_el.src.length-15);
        if(postava_img=="nekromancer.png")
        {
        nekromancer_ability(karta_el,protihrac_nekromancer_napravo,protihrac_nekromancer_nalevo);
        }
    }
}

// Čistič všech rámečků ze všech karet
function odstran_vsechny_protihrac_ramecky() {
    const tridy = ["protihrac_prvni_ramecek", "protihrac_druhy_ramecek", "protihrac_treti_ramecek"];
    const elementy = document.querySelectorAll(tridy.map(t => '.' + t).join(', '));
    elementy.forEach(el => {
        tridy.forEach(t => el.classList.remove(t));
    });
}

// Opravená funkce pro AI útok (umí mazat i tvé, i AI karty)
function proved_utok_ai(utocnik_objekt, obrance_objekt) {
    obrance_objekt.hp -= utocnik_objekt.dmg * kamen_nuzky_papir(utocnik_objekt, obrance_objekt);

    if (obrance_objekt.hp <= 0) {
        let el = document.getElementById(obrance_objekt.id);
        if (!el) return;

        let rodic = el.parentElement;

        //Mazání abilitek, které může mít postava.
        let ability_sloupec_el = document.getElementById(rodic.id + "_ability");
        while (ability_sloupec_el.childElementCount > 0) {
            ability_sloupec_el.children[0].remove();
        }

        //Připisování bodů protihráčovy
        let protihrac_body_int = Number(document.getElementById("protihrac_body").innerHTML);
        protihrac_body_int += obrance_objekt.body;
        document.getElementById("protihrac_body").innerHTML = protihrac_body_int;

        el.remove();

        // Hledání, ve kterém poli mrtvá karta byla a bezpečné uvolnění slotu
        let index_hrac = hrac_prostredek_objekty_karty.findIndex(k => k.id === obrance_objekt.id);
        if (index_hrac > -1) {
            hrac_prostredek_objekty_karty.splice(index_hrac, 1);
        } else {
            let index_ai = protihrac_prostredek_objekty_karty.findIndex(k => k.id === obrance_objekt.id);
            if (index_ai > -1) {
                protihrac_prostredek_objekty_karty.splice(index_ai, 1);
                protihrac_prostredek_prazdne_misto.push(rodic.id);
            }
        }
    }
    else {
        abilitky_karet(utocnik_objekt, obrance_objekt);
    }
}

async function protihrac_random_tahy() {
    hraje_hrac = false;
    let tahy_k_dispozici = 3;
    let naplanovane_tahy = []; // Fronta funkcí k vykonání nakonec

    prohledani_karet_uprostred_ability();   //Používá se na hráčovy (moje) karty

    // --- VIRTUÁLNÍ STAV PRO PLÁNOVÁNÍ ---
    // Aby AI vědělo, s čím už v rámci těchto 3 tahů manipulovalo
    let v_ruce_karty = [...protihrac_inventar_objekty_karty];
    let v_ruce_pocet = protihrac_inventar_objekty_karty.length;
    let volne_sloty = [...protihrac_prostredek_prazdne_misto];
    let na_stole_karty = [...protihrac_prostredek_objekty_karty];
    let utocnici = [...protihrac_prostredek_objekty_karty]; // Karty, které ještě tento tah neútočily

    // --- PŘIDÁNO: Počáteční pauza, aby AI nezačalo hrát okamžitě ---
    await pauza(1500);

    for (let i = 0; i < tahy_k_dispozici; i++) {
        // Třídy pro rámečky (1., 2. a 3. tah)
        let trida_ramecku = `protihrac_${["prvni", "druhy", "treti"][i]}_ramecek`;

        // 1. Co je momentálně (virtuálně) možné?
        let muze_liznout = v_ruce_pocet < 5 && pocet_karet_v_pakliku_protihrac > 0;

        let minioni_v_ruce = v_ruce_karty.filter(k => k.trida !== "Spell");
        let muze_vylozit_miniona = minioni_v_ruce.length > 0 && volne_sloty.length > 0;

        let spelly_v_ruce = v_ruce_karty.filter(k => k.trida === "Spell");
        let pouzitelne_spelly = spelly_v_ruce.filter(spell => {
            if (spell.dmg > 0) return hrac_prostredek_objekty_karty.length > 0; // Útok
            else return na_stole_karty.length > 0; // Heal
        });
        let muze_vylozit_spell = pouzitelne_spelly.length > 0;

        let muze_vylozit = muze_vylozit_miniona || muze_vylozit_spell;

        // Zjistíme, které karty na stole mohou tento tah reálně něco udělat
        let pouzitelni_utocnici = utocnici.filter(karta => {
            if (karta.dmg > 0) {
                return hrac_prostredek_objekty_karty.length > 0; // Útočník potřebuje tvoje karty
            } else {
                return na_stole_karty.length > 0; // Healer potřebuje vlastní karty (minimálně sebe)
            }
        });

        let muze_utocit = pouzitelni_utocnici.length > 0;   //Počet healerů a útočníků protihráče, nejsou to spelly
        let nalezen_spravny_objekt = false;
        if (muze_utocit) {    //Nastavení protihráčových karet, které může použít
            for (let o = pouzitelni_utocnici.length - 1; o >= 0; o--) {
                let objekt = pouzitelni_utocnici[o];
                let el = document.getElementById(objekt.id);
                let rodic_protihrace = el.parentElement;
                let cislo_rodice_protihrace = parseInt(rodic_protihrace.id[rodic_protihrace.id.length - 1], 10);
                let vzdalenost_protihrace = objekt.vzdalenost;
                nalezen_spravny_objekt = false;
                if (objekt.dmg > 0) {   //Pro protihráče útočníka
                    for (let k = 0; k < vzdalenost_protihrace; k++) {
                        if (cislo_rodice_protihrace + k < 5) {
                            if (document.getElementById("hrac_pole_karta" + parseInt(cislo_rodice_protihrace + k, 10)).childElementCount > 0) {
                                nalezen_spravny_objekt = true;
                                break;
                            }
                        }
                        if (cislo_rodice_protihrace - k > 0) {
                            if (document.getElementById("hrac_pole_karta" + parseInt(cislo_rodice_protihrace - k, 10)).childElementCount > 0) {
                                nalezen_spravny_objekt = true;
                                break;
                            }


                        }
                    }
                    if (!nalezen_spravny_objekt) {
                        pouzitelni_utocnici.splice(o, 1);
                    }
                }
                else {               //Pro protihráče healera
                    for (let k = 0; k < vzdalenost_protihrace; k++) {
                        if (cislo_rodice_protihrace + k < 5) {
                            if (document.getElementById("protihrac_pole_karta" + parseInt(cislo_rodice_protihrace + k, 10)).childElementCount > 0) {
                                nalezen_spravny_objekt = true;
                                break;
                            }


                        }
                        if (cislo_rodice_protihrace - k > 0) {
                            if (document.getElementById("protihrac_pole_karta" + parseInt(cislo_rodice_protihrace - k, 10)).childElementCount > 0) {
                                nalezen_spravny_objekt = true;
                                break;
                            }


                        }
                    }
                    if (!nalezen_spravny_objekt) {
                        pouzitelni_utocnici.splice(o, 1);
                    }
                }
                if (pouzitelni_utocnici.length <= 0) {  //Pokud hráč nemůže ničím útočit, díky vzdálenosti, tak se to tady nastaví, aby nemohl útočit
                    muze_utocit = false;
                }
            }
        }
        // 2. Tvorba koše platných akcí
        let mozne_akce = [];
        if (muze_vylozit) mozne_akce.push(0);
        if (muze_liznout) mozne_akce.push(1);
        if (muze_utocit) mozne_akce.push(2);

        // 3. Kontrola: Může AI vůbec něco dělat?
        if (mozne_akce.length === 0) {
            console.log("AI už nemá žádné platné tahy k naplánování.");
            break; // Ukončí plánování
        }

        // 4. Výběr akce
        let akce = mozne_akce[Math.floor(Math.random() * mozne_akce.length)];

        posunuti_rucicky();
        // 5. Zpracování akce a přidání do fronty
        if (akce === 0) {
            // --- VYLOŽENÍ KARTY ---
            console.log("Protihráč pokládá kartu.");
            let hratelne_karty = [];
            if (volne_sloty.length > 0) hratelne_karty.push(...minioni_v_ruce);
            hratelne_karty.push(...pouzitelne_spelly);

            let vybrana_karta = hratelne_karty[Math.floor(Math.random() * hratelne_karty.length)];
            let karta_el = document.getElementById(vybrana_karta.id);
            karta_el.classList.add(trida_ramecku);

            // Úprava virtuální ruky
            v_ruce_karty = v_ruce_karty.filter(k => k.id !== vybrana_karta.id);
            v_ruce_pocet--;

            if (vybrana_karta.trida !== "Spell") {
                let slot_id = volne_sloty.shift(); // Virtuálně zabere slot
                protihrac_prostredek_prazdne_misto=[...volne_sloty];
                document.getElementById(slot_id).classList.add(trida_ramecku);

                /////////////////////////////////////////////////////////////////////////////////
                postava_img = karta_el.src.substring(karta_el.src.length-15);
                let slot_el = document.getElementById(slot_id);
                let prazdne_misto_prava_leva_id = slot_el.id.substring(0,slot_el.id.length-1);
                if(postava_img=="nekromancer.png")
                {
                protihrac_nekromancer_napravo = nekromancer_misto_napravo(slot_el);
                protihrac_nekromancer_nalevo = nekromancer_misto_nalevo(slot_el);
                if(protihrac_nekromancer_napravo){//Dát to na místo, kde se dává ten rámeček toho nekromancera.
                    let cislo_nakonci_skeletona_napravo = parseInt(slot_el.id[slot_el.id.length-1], 10) + 1;
                    let index_protihrac_vymazani_prazdneho_mista_uprostred = protihrac_prostredek_prazdne_misto.findIndex(k=> k==prazdne_misto_prava_leva_id+cislo_nakonci_skeletona_napravo);
                    if(index_protihrac_vymazani_prazdneho_mista_uprostred>-1)
                    protihrac_prostredek_prazdne_misto.splice(index_protihrac_vymazani_prazdneho_mista_uprostred,1);
                }
                if(protihrac_nekromancer_nalevo){
                    let cislo_nakonci_skeletona_nalevo = parseInt(slot_el.id[slot_el.id.length-1], 10) - 1;
                    let index_protihrac_vymazani_prazdneho_mista_uprostred = protihrac_prostredek_prazdne_misto.findIndex(k=> k==prazdne_misto_prava_leva_id+cislo_nakonci_skeletona_nalevo);
                    if(index_protihrac_vymazani_prazdneho_mista_uprostred>-1)
                    protihrac_prostredek_prazdne_misto.splice(index_protihrac_vymazani_prazdneho_mista_uprostred,1);
                }
                volne_sloty= [...protihrac_prostredek_prazdne_misto];
                console.log(volne_sloty);
                }
                /////////////////////////////////////////////////////////////////////////////////
                

                naplanovane_tahy.push(() => protihrac_presunuti_karty_vykonani(vybrana_karta, slot_id));
            } else {
                // Spell cíl
                let cile = vybrana_karta.dmg > 0 ? hrac_prostredek_objekty_karty : na_stole_karty;
                let cil_objekt = cile[Math.floor(Math.random() * cile.length)];
                document.getElementById(cil_objekt.id).classList.add(trida_ramecku);

                naplanovane_tahy.push(() => {
                    karta_el.remove(); // Smazání spellu z grafiky
                    let index = protihrac_inventar_objekty_karty.findIndex(k => k.id === vybrana_karta.id);
                    if (index > -1) protihrac_inventar_objekty_karty.splice(index, 1);
                    proved_utok_ai(vybrana_karta, cil_objekt);
                });
            }
        }
        else if (akce === 1) {
            // --- LÍZNUTÍ ---
            // Najdeme tlačítko balíčku a orámečkujeme ho
            console.log("Protihráč si líže kartu.");
            pocet_karet_v_pakliku_protihrac--;
            document.getElementById("pocitadlo_protihrac_text").innerHTML = pocet_karet_v_pakliku_protihrac;
            let tlacitko_pridani = document.getElementById("pridavani_karet");
            if (tlacitko_pridani) {
                tlacitko_pridani.classList.add(trida_ramecku);
            }

            v_ruce_pocet++;
            naplanovane_tahy.push(() => pridani_karty("protihrac"));
        }
        else if (akce === 2) {
            // --- ÚTOK / HEAL ZE STOLU ---
            // Vybere náhodně POUZE z karet, které mají povolený cíl
            console.log("Protihráč útočí/healuje.");
            let utocnik = pouzitelni_utocnici[Math.floor(Math.random() * pouzitelni_utocnici.length)];

            // Odstraníme ho z hlavní fronty utocnici, aby nehrál tento tah znovu
            let utocnik_index = utocnici.findIndex(k => k.id === utocnik.id);
            if (utocnik_index > -1) utocnici.splice(utocnik_index, 1);

            // Pokud AI healuje útokem, hledá u sebe. Jinak u tebe.
            let stred_hrace_protihrace = utocnik.dmg > 0 ? hrac_prostredek_objekty_karty : na_stole_karty;        //Tady to dodělat
            let rodic_protihrace = document.getElementById(utocnik.id).parentElement;
            let cislo_rodice_protihrace = parseInt(rodic_protihrace.id[rodic_protihrace.id.length - 1], 10);
            let vzdalenost = utocnik.vzdalenost - 1;
            let cile = [];
            stred_hrace_protihrace.forEach(objekt => {
                let el = document.getElementById(objekt.id);
                let rodic_hrace_protihrace = el.parentElement;
                let cislo_rodice_hrace_protihrace = parseInt(rodic_hrace_protihrace.id[rodic_hrace_protihrace.id.length - 1], 10);
                if (cislo_rodice_protihrace - vzdalenost <= cislo_rodice_hrace_protihrace &&
                    cislo_rodice_protihrace + vzdalenost >= cislo_rodice_hrace_protihrace) {
                    if (el) {
                        cile.push(objekt);
                    }
                }
            });
            if(cile.length>0){
            let obrance = cile[Math.floor(Math.random() * cile.length)];

            document.getElementById(utocnik.id).classList.add(trida_ramecku);
            document.getElementById(obrance.id).classList.add(trida_ramecku);

            naplanovane_tahy.push(() => proved_utok_ai(utocnik, obrance));
            }
            else
                console.log("Protihráč se dostal do útočení, ale nemá na koho útočit.");
        }

        // Časová prodleva 1.5 sekundy po označení tahu
        await pauza(1500);
    }

    // Nyní proběhne vykonání všech nasbíraných tahů v jeden moment!
    naplanovane_tahy.forEach(tah_funkce => tah_funkce());

    // Úklid rámečků
    odstran_vsechny_protihrac_ramecky();
    posunuti_rucicky("protihrac_posledni");

    console.log("Protihráč dohrál.");
    pocet_kol++;
    hraje_hrac = true;
    pocet_tahu = 3;
    document.getElementById("kola").innerHTML = "Počet kol: " + pocet_kol;

    // Oživení tlačítka
    let btn = document.getElementById("pridavani_karet");
    if (hrac_inventar_objekty_karty.length < 5 && pocet_karet_v_pakliku_hrac >= 0) {
        btn.classList.add("clickable");
        btn.onclick = function () { pridani_karty("hrac"); };
    }

    hrac_prostredek_objekty_karty.forEach(obj => {
        let el = document.getElementById(obj.id);
        if (el) el.classList.add("clickable");
    });

    //vykonání abilitek na protihráčových kartách
    prohledani_karet_uprostred_ability();
}

// --- BOJ ---

function utok(karta_element_nebo_id) {
    // Získáme ID (pokud je předán element, vezmeme jeho ID)
    let utocnik_id = (karta_element_nebo_id instanceof Element) ? karta_element_nebo_id.id : karta_element_nebo_id;

    // Najdeme útočící kartu v poli hráče
    utocici_karty_objekty[utocici_karty_objekty_index] = hrac_prostredek_objekty_karty.find(k => k.id === utocnik_id);

    if (!utocici_karty_objekty[utocici_karty_objekty_index]) {
        utocici_karty_objekty[utocici_karty_objekty_index] = hrac_inventar_objekty_karty.find(k => k.id === utocnik_id);
    }
    if (!utocici_karty_objekty[utocici_karty_objekty_index]) {
        console.log("Chyba: Útočící karta nenalezena u hráče");
        return;
    }

    smazani_ostatnich_fci();
    let rodic_hrace = document.getElementById(utocnik_id).parentElement;
    let cislo_rodice_hrace = parseInt(rodic_hrace.id[rodic_hrace.id.length - 1], 10);
    let vzdalenost = utocici_karty_objekty[utocici_karty_objekty_index].vzdalenost - 1;
    // Nastavíme karty protihráče jako cíle
    if (utocici_karty_objekty[utocici_karty_objekty_index].trida === "Spell") {
        cislo_rodice_hrace = 2;
    }
    protihrac_prostredek_objekty_karty.forEach(objekt => {
        let el = document.getElementById(objekt.id);
        let rodic_protihrace = el.parentElement;
        let cislo_rodice_protihrace = parseInt(rodic_protihrace.id[rodic_protihrace.id.length - 1], 10);
        if (cislo_rodice_hrace - vzdalenost <= cislo_rodice_protihrace &&
            cislo_rodice_hrace + vzdalenost >= cislo_rodice_protihrace) {
            if (el) {
                el.classList.add("clickable");
                el.onclick = function () { snizeni_hp(objekt.id); }; // Předáváme ID cíle
            }
        }
    });
}

// Přidali jsme druhý parametr pro bezpečné uchování ID útočníka
function snizeni_hp(cil_id, utocnik_id_pro_vykonani = null) {
    // Normalizace: Získáme vždy textové ID prvku
    let spravne_id = (cil_id instanceof Element) ? cil_id.id : cil_id;

    if (hraje_hrac) {
        if (spusteni_tahu) {
            // --- HRÁČ ÚTOČÍ NEBO HEALUJE (VYKONÁNÍ TAHU) ---
            
            // OPRAVA: Získání ID útočníka z bindu (pokud ho máme), jinak z pole
            let utocici_karta_id = utocnik_id_pro_vykonani ? utocnik_id_pro_vykonani : utocici_karty_objekty[utocici_karty_objekty_index]?.id;
            let utocici_karta_hrace = utocici_karta_id ? document.getElementById(utocici_karta_id) : null;
            let cil_element = document.getElementById(spravne_id);

            // BEZPEČNÉ ODSTRANĚNÍ RÁMEČKŮ
            if (cil_element) cil_element.classList.remove("prvni_ramecek", "druhy_ramecek", "treti_ramecek");
            if (utocici_karta_hrace) utocici_karta_hrace.classList.remove("prvni_ramecek", "druhy_ramecek", "treti_ramecek");

            let cilovy_objekt;
            if (utocici_karty_objekty[utocici_karty_objekty_index].dmg > 0) {
                // Hledáme cíl u protihráče (útok)
                let index_cile = protihrac_prostredek_objekty_karty.findIndex(k => k.id === spravne_id);
                if (index_cile === -1) {
                    if (utocici_karty_objekty[utocici_karty_objekty_index].trida === "Spell") {
                        let smazat_spell_id = utocici_karty_objekty[utocici_karty_objekty_index].id;
                        let spell_el = document.getElementById(smazat_spell_id);
                        if (spell_el && spell_el.parentElement) {
                            spell_el.parentElement.remove();
                        }
                        let index = hrac_inventar_objekty_karty.findIndex(k => k.id === smazat_spell_id);
                        if (index > -1) hrac_inventar_objekty_karty.splice(index, 1);
                    }
                    utocici_karty_objekty_index++;
                    vybrane_karty_index++;
                    return;
                }
                cilovy_objekt = protihrac_prostredek_objekty_karty[index_cile];
            } else {
                // Hledáme cíl u hráče (heal)
                let index_cile = hrac_prostredek_objekty_karty.findIndex(k => k.id === spravne_id);
                if (index_cile === -1) {
                    utocici_karty_objekty_index++;
                    vybrane_karty_index++;
                    return;
                }
                cilovy_objekt = hrac_prostredek_objekty_karty[index_cile];
            }

            // Výpočet poškození / healu
            cilovy_objekt.hp -= utocici_karty_objekty[utocici_karty_objekty_index].dmg * kamen_nuzky_papir(utocici_karty_objekty[utocici_karty_objekty_index], cilovy_objekt);

            // Kontrola smrti karty
            if (cilovy_objekt.hp <= 0) {
                let el = document.getElementById(spravne_id);
                let rodic = el.parentElement;

                let ability_sloupec_el = document.getElementById(rodic.id + "_ability");
                while (ability_sloupec_el && ability_sloupec_el.childElementCount > 0) {
                    ability_sloupec_el.children[0].remove();
                }

                let hrac_body_int = Number(document.getElementById("hrac_body").innerHTML);
                hrac_body_int += cilovy_objekt.body;
                document.getElementById("hrac_body").innerHTML = hrac_body_int;

                if (el) el.remove();
                protihrac_prostredek_prazdne_misto.push(rodic.id);

                let smazat_index = protihrac_prostredek_objekty_karty.findIndex(k => k.id === spravne_id);
                if (smazat_index > -1) protihrac_prostredek_objekty_karty.splice(smazat_index, 1);
            }
            else {
                abilitky_karet(utocici_karty_objekty[utocici_karty_objekty_index], cilovy_objekt);
            }

            if (utocici_karty_objekty[utocici_karty_objekty_index].trida === "Spell") {
                let smazat_spell_id = utocici_karty_objekty[utocici_karty_objekty_index].id;
                let spell_el = document.getElementById(smazat_spell_id);
                if (spell_el && spell_el.parentElement) {
                    spell_el.parentElement.remove();
                }

                let index = hrac_inventar_objekty_karty.findIndex(k => k.id === smazat_spell_id);
                if (index > -1) hrac_inventar_objekty_karty.splice(index, 1);
            }

            protihrac_prostredek_objekty_karty.forEach(obj => {
                let el = document.getElementById(obj.id);
                if (el) { el.classList.remove("clickable"); el.onclick = null; }
            });

            hrac_prostredek_objekty_karty.forEach(obj => {
                let el = document.getElementById(obj.id);
                if (el) {
                    el.classList.remove("clickable");
                    if (obj.dmg > 0) {
                        el.onclick = function () { utok(this); };
                    } else {
                        el.onclick = function () { healovani(this); };
                    }
                }
            });

            utocici_karty_objekty_index++;
            vybrane_karty_index++;
        }
        else {
            // --- PLÁNOVÁNÍ TAHU ---
            if (pocet_tahu > 0) {
    smazani_ostatnich_fci();
    let utocici_karta_id = utocici_karty_objekty[utocici_karty_objekty_index].id;
    let utocici_karta_hrace = document.getElementById(utocici_karta_id);
    
console.log(utocici_karta_hrace);
console.log(utocici_karta_hrace.onclick);

    if (utocici_karta_hrace.onclick === null) {
        console.log("Karta už je používána.");
        return;
    }

    pocet_tahu--;
    posunuti_rucicky();
    document.getElementById("text_ukazatel_tahu").innerHTML = "Počet tahů: <br>"+pocet_tahu;
    document.getElementById("konecTahu").classList.add("clickable");
    let cil_element = document.getElementById(spravne_id);

    // 1. NEJDŘÍV VYTÁHNEME RÁMEČEK A PŘIŘADÍME HO KARTÁM
    let prirazeny_ramecek = ramecky_k_pouziti.shift();
    if (prirazeny_ramecek) {
        cil_element.classList.add(prirazeny_ramecek);
        utocici_karta_hrace.classList.add(prirazeny_ramecek);
    }

    // 2. AŽ TEĎ VYTVOŘÍME KŘÍŽEK A PŘEDÁME MU INFORMACI O RÁMEČKU
    let rodic_utocnika = utocici_karta_hrace.parentElement;
    rodic_utocnika.appendChild(Vytvoreni_zruseni_tahu("utok", prirazeny_ramecek));

    // Zbytek tvého kódu zůstává beze změny:
    if (prvni_tah == null) { prvni_tah = snizeni_hp.bind(null, spravne_id, utocici_karta_id); }
    else if (druhy_tah == null) { druhy_tah = snizeni_hp.bind(null, spravne_id, utocici_karta_id); }
    else if (treti_tah == null) { treti_tah = snizeni_hp.bind(null, spravne_id, utocici_karta_id); }

    utocici_karta_hrace.onclick = null; 
    utocici_karta_hrace.classList.remove("clickable");

    if (utocici_karty_objekty[utocici_karty_objekty_index].trida === "Spell") {
        let parent = utocici_karta_hrace.parentElement;
        
        // 2. OPRAVA: BEZPEČNÉ MAZÁNÍ KŘÍŽKU (nesmaže omylem naše tlačítko)
        let vsechny_deti = parent.children;
        for(let i = 0; i < vsechny_deti.length; i++) {
            if(!vsechny_deti[i].classList.contains("karty") && !vsechny_deti[i].classList.contains("zruseni_tahu")) {
                vsechny_deti[i].remove();
                i--; // Úprava indexu po smazání prvku
            }
        }

        utocici_karta_hrace.classList.remove("zakliknuta_karta");
        je_zakliknuta_karta = false; 
        zakliknuta_karta_id = null;
        pomocne_pocitadlo_karet_v_inv--;
        
        let btn = document.getElementById("pridavani_karet");
        if (pocet_karet_v_pakliku_hrac >= 0) {
            btn.classList.add("clickable");
            btn.onclick = function () { pridani_karty("hrac"); };
        }
    }

                protihrac_prostredek_objekty_karty.forEach(obj => {
                    let el = document.getElementById(obj.id);
                    if (el) { el.classList.remove("clickable"); el.onclick = null; }
                });

                vybrane_karty_index++;
                utocici_karty_objekty_index++;
            }
            else {
                console.log("Hráč už nemá tahy.");
            }
        }
    }
}


// Jednoduchá funkce pro čekání
function pauza(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Začne dělat hráčovy tahy po stisknutí tlačítka
async function potvrzeni_tahu() {
    if (pocet_tahu < 3) {
        posunuti_rucicky("potvrzeni_tahu");
        vybrane_karty_index = 0;  //Proto aby fungovalo dobře přesouvání karet;

        document.getElementById("konecTahu").classList.remove("clickable");    //Změna kurzoru při najetí na potvrzení tahu
        document.getElementById("konecTahu").onclick = null;

        spusteni_tahu = true;
        utocici_karty_objekty_index = 0;  //Aby fungovalo útočení

        let tlacitko_pridani = document.getElementById("pridavani_karet");
        let zruseni_tahu_element = tlacitko_pridani.parentElement.getElementsByClassName("zruseni_tahu");
            if(zruseni_tahu_element.length>0)
                    zruseni_tahu_element[0].remove();

        if(prvni_tah != null)
        prvni_tah();
        prvni_tah = null;
        if (druhy_tah != null) {
            druhy_tah();
            druhy_tah = null;

        }
        if (treti_tah != null) {
            treti_tah();
            treti_tah = null;
        }

        //Mazání rámečků kolem karet
        let hracovo_pole_karet_prostredek = document.getElementById("pole_vykladani_hrace");
        Array.from(hracovo_pole_karet_prostredek.children).forEach(prazdne_misto => {
            if (prazdne_misto.children.length > 0) {
                prazdne_misto.children[0].classList.remove("prvni_ramecek");
                prazdne_misto.children[0].classList.remove("druhy_ramecek");
                prazdne_misto.children[0].classList.remove("treti_ramecek");
                let zruseni_tahu_element = prazdne_misto.getElementsByClassName("zruseni_tahu");
                if(zruseni_tahu_element.length>0)
                    zruseni_tahu_element[0].remove();
            }
        });

        let hracuv_inventar_element = document.getElementById("hracovy_karty");
        for(let i =0;i<hracuv_inventar_element.childElementCount;i++){
            if(hracuv_inventar_element.children[i].childElementCount>1)
                hracuv_inventar_element.children[i].lastChild.remove();
        }

        //Hraje protihráč
        await protihrac_random_tahy();

        //Hráč je znovu na tahu
        pocet_tahu = 3;
        document.getElementById("text_ukazatel_tahu").innerHTML = "Počet tahů: <br>"+pocet_tahu;
        spusteni_tahu = false;

        //Pro funkční přesouvání karet, útočení a přidávání je to potřeba nullovat

        for (let i = 0; i < 3; i++) {
            vybrane_karty[i] = null;
            utocici_karty_objekty[i] = null;
        }
        utocici_karty_objekty_index = 0;
        vybrane_karty_index = 0;
        pomocne_pocitadlo_karet_v_inv = 0;
        pomocne_pole_pri_healovani = [];
        cislo_ramecku = 1;
        ramecky_k_pouziti = ["prvni_ramecek","druhy_ramecek","treti_ramecek"];
        //a upravit křížek a karty v inventáři, aby se při zakliknutí nepřesouvali a křížek se posouval společně s kartou
        for(let i =0;i<hracuv_inventar_element.childElementCount;i++){
            if(hracuv_inventar_element.children[i].childElementCount==1)
                hracuv_inventar_element.children[i].appendChild(Vytvoreni_krizku());
        }
        byl_pouzit_krizek = false;

        //Přidání tlačítku na zahájení tahů zpátky jeho funkci
        document.getElementById("konecTahu").onclick = function(){potvrzeni_tahu();};
    }
    //Když hráč neudělá ani jeden tah, tak to nejde spustit
    else {
        console.log("Hráč neudělal ani jeden tah.");
    }
}

//Vypisování informací o kartě, na kterou zrovna najel
document.addEventListener('mouseover', (event) => {

    // Získáme konkrétní element, na kterém je teď myš
    const najetyElement = event.target;
    let informace = document.getElementById("informace");
    informace.innerHTML = "Informace";//Resetování informací
    let objekt_karta;

    //Psaní informací při najetí na hráčovy karty
    if (najetyElement.classList.contains("karty")) {
        for (let i = 0; i < hrac_inventar_objekty_karty.length; i++) {
            if (najetyElement.id === hrac_inventar_objekty_karty[i].id)
                objekt_karta = hrac_inventar_objekty_karty[i];
        }
        for (let i = 0; i < hrac_prostredek_objekty_karty.length; i++) {
            if (najetyElement.id === hrac_prostredek_objekty_karty[i].id)
                objekt_karta = hrac_prostredek_objekty_karty[i];
        }
        if (objekt_karta.dmg > 0)
            informace.innerHTML += "<br><br>Hráčova karta:<br><br>HP:" + objekt_karta.hp + "<br>DMG:" + objekt_karta.dmg;
        else
            informace.innerHTML += "<br><br>Hráčova karta:<br><br>HP:" + objekt_karta.hp + "<br>Heal:" + (-1 * objekt_karta.dmg);
        informace.innerHTML += "<br><br>Třída:" + objekt_karta.trida + "<br><br>Dosah: " + objekt_karta.vzdalenost + "<br><br>Body: " + objekt_karta.body;
    }

    //Psaní informací při najetí na protihráčovy karty
    else if (najetyElement.classList.contains("protihrac_karty")) {
        for (let i = 0; i < protihrac_inventar_objekty_karty.length; i++) {
            if (najetyElement.id === protihrac_inventar_objekty_karty[i].id)
                objekt_karta = protihrac_inventar_objekty_karty[i];
        }
        for (let i = 0; i < protihrac_prostredek_objekty_karty.length; i++) {
            if (najetyElement.id === protihrac_prostredek_objekty_karty[i].id)
                objekt_karta = protihrac_prostredek_objekty_karty[i];
        }
        if (objekt_karta.dmg > 0)
            informace.innerHTML += "<br><br>Protihráčova karta:<br><br>HP:" + objekt_karta.hp + "<br>DMG:" + objekt_karta.dmg;
        else
            informace.innerHTML += "<br><br>Protihráčova karta:<br><br>HP:" + objekt_karta.hp + "<br>Heal:" + (-1 * objekt_karta.dmg);
        informace.innerHTML += "<br><br>Třída:" + objekt_karta.trida + "<br><br>Dosah: " + objekt_karta.vzdalenost + "<br><br>Body: " + objekt_karta.body;
    }

});


function spell(objekt_spellu) {
    //Karta útočí
    if (objekt_spellu.dmg > 0) {
        if (protihrac_prostredek_objekty_karty.length > 0) {
            utok(objekt_spellu.id);
        }
        else {
            console.log("Spell nejde využít, protihráč nemá na středu karty.");
            return;
        }
    }
    //Karta healuje
    else {
        if (hrac_prostredek_objekty_karty.length > 0) {
            healovani(objekt_spellu.id);
        }
        else {
            console.log("Spell nejde využít, hráč nemá na středu karty.");
            return;
        }
    }
}

function healovani(karta_element_nebo_id) {
    let karta_healovani_id = (karta_element_nebo_id instanceof Element) ? karta_element_nebo_id.id : karta_element_nebo_id;
    smazani_ostatnich_fci();
    // Zkusíme najít healující kartu na stole
    utocici_karty_objekty[utocici_karty_objekty_index] = hrac_prostredek_objekty_karty.find(k => k.id === karta_healovani_id);

    // Pokud není na stole, zkusíme inventář (pro Spelly)
    if (!utocici_karty_objekty[utocici_karty_objekty_index]) {
        utocici_karty_objekty[utocici_karty_objekty_index] = hrac_inventar_objekty_karty.find(k => k.id === karta_healovani_id);
    }

    if (!utocici_karty_objekty[utocici_karty_objekty_index]) {
        console.log("Chyba: Healující karta nenalezena");
        return;
    }


    let rodic_hrace = document.getElementById(karta_healovani_id).parentElement;
    let cislo_rodice_hrace = parseInt(rodic_hrace.id[rodic_hrace.id.length - 1], 10);
    let vzdalenost = utocici_karty_objekty[utocici_karty_objekty_index].vzdalenost - 1;
    if (utocici_karty_objekty[utocici_karty_objekty_index].trida === "Spell") {
        cislo_rodice_hrace = 2;
    }
    // Nastavíme TVOJE VLASTNÍ karty na stole jako cíle (pro heal)
    hrac_prostredek_objekty_karty.forEach(objekt => {
        let el = document.getElementById(objekt.id);
        let rodic_hrace2 = el.parentElement;
        let cislo_rodice_hrace2 = parseInt(rodic_hrace2.id[rodic_hrace2.id.length - 1], 10);
        if (cislo_rodice_hrace - vzdalenost <= cislo_rodice_hrace2 &&
            cislo_rodice_hrace + vzdalenost >= cislo_rodice_hrace2) {
            if (el) {
                el.classList.add("clickable");
                if (el.onclick === null) {
                    pomocne_pole_pri_healovani.push(objekt);    //Tady je problém
                }
                el.onclick = function () { snizeni_hp(objekt.id); }; // Cíl je tvoje karta
            }
        }
    });
}

function smazani_ostatnich_fci() {
    //mazání f-ce snizeni_hp() a healovani() karet, která jsou na prostředku
    if (protihrac_prostredek_objekty_karty.length > 0) {
        let pole_vykladani_protihrace = document.getElementById("pole_vykladani_protihrace");
        for (let i = 0; i < pole_vykladani_protihrace.childElementCount; i++) {
            let element_prazdneho_mista = pole_vykladani_protihrace.children[i];
            if (element_prazdneho_mista.childElementCount > 0) {
                let protihrac_karta_prostredek = element_prazdneho_mista.children[0];
                if (protihrac_karta_prostredek.classList.contains("protihrac_karty")) {
                    protihrac_karta_prostredek.onclick = null;
                    protihrac_karta_prostredek.classList.remove("clickable");
                }
            }
        }
    }
    //přiřazení f-ce snizenihp() a healovani hp() hracovym kartam na prostredku
    if (hrac_prostredek_objekty_karty.length > 0) {
        let pole_vykladani_hrace = document.getElementById("pole_vykladani_hrace");
        for (let i = 0; i < pole_vykladani_hrace.childElementCount; i++) {
            let element_prazdneho_mista = pole_vykladani_hrace.children[i];

            if (element_prazdneho_mista.childElementCount > 0) {
                let hrac_karta_prostredek = element_prazdneho_mista.children[0];
                if (hrac_karta_prostredek.classList.contains("karty")) {
                    console.log(pomocne_pole_pri_healovani);
                    for (let i = 0; i < pomocne_pole_pri_healovani.length; i++) {
                        if (hrac_karta_prostredek.id === pomocne_pole_pri_healovani[i].id) {
                            console.log("Nuluji tuhle kartu: "+hrac_karta_prostredek);
                            hrac_karta_prostredek.onclick = null;   //Možná tady
                            hrac_karta_prostredek.classList.remove("clickable");
                        }
                    }
                    if (pomocne_pole_pri_healovani.length != hrac_prostredek_objekty_karty.length) {
                        for (let o = 0; o < hrac_prostredek_objekty_karty.length; o++) {
                            if (hrac_prostredek_objekty_karty[o].id === hrac_karta_prostredek.id && hrac_karta_prostredek.onclick != null) {
                                if (hrac_prostredek_objekty_karty[o].dmg > 0) {
                                    hrac_karta_prostredek.onclick = function () { utok(this); };
                                }
                                else {
                                    hrac_karta_prostredek.onclick = function () { healovani(this); };
                                }
                                hrac_karta_prostredek.classList.add("clickable");
                            }
                        }
                    }
                }
            }
        }
    }
    pomocne_pole_pri_healovani = [];
}

//čas podemnou čas script

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

//nademnou čas script

//Fungování abilitek karet podemonu a přiřazení obrázků do ability sloupce
function abilitky_karet(utocici_karta_objekt, cilova_karta_objekt) {
    if (utocici_karta_objekt.ability != "") {
        for (let i = 0; i < cilova_karta_objekt.debuff.length; i++) {
            if (cilova_karta_objekt.debuff[i] === utocici_karta_objekt.ability) {
                return;
            }
        }

        cilova_karta_objekt.debuff.push(utocici_karta_objekt.ability);
        //Udělat pro hráče i protihráče
        let element_cilove_karty = document.getElementById(cilova_karta_objekt.id);
        let rodic = element_cilove_karty.parentElement;
        let ability_sloupec_el = document.getElementById(rodic.id + "_ability");

        //Vytvoření abilitky a dosazení do sloupce
        const img = document.createElement("img");
        switch (utocici_karta_objekt.ability) {
            case "ohen":
                img.src = "./Obrazky/8_8_" + utocici_karta_objekt.ability + ".png";
                img.id = prirazeni_ability_id(utocici_karta_objekt.ability); break;
            case "jed":
                img.src = "./Obrazky/8_8_" + utocici_karta_objekt.ability + ".png";
                img.id = prirazeni_ability_id(utocici_karta_objekt.ability); break;
            default:
                console.log("chybka ve switch(utocici_karta_objekt.ability"); break;

        }
        img.classList.add("ability_class");
        // nenalezeno console.log(ability_sloupec_el);
        ability_sloupec_el.appendChild(img);
    }
}


function pouziti_debuffu(debuff_karta_objekt) {
    if (debuff_karta_objekt.debuff.length != 0) {
        for (let i = 0; i < debuff_karta_objekt.debuff.length; i++) {
            switch (debuff_karta_objekt.debuff[i]) {
                case "ohen": debuff_karta_objekt.hp -= 5;break;
                case "jed": debuff_karta_objekt.hp -= 10;break;
                default: console.log("Chyba při ve funkci pouziti_abilitek. řádek 1184"); break;
            }
        }
        if (debuff_karta_objekt.hp <= 0) {
            let el = document.getElementById(debuff_karta_objekt.id);
            let rodic = el.parentElement;

            //Smazání abilitek ve sloupci vedle postavy, která zemře a bude vymazána.
            let ability_sloupec_el = document.getElementById(rodic.id + "_ability");
            while (ability_sloupec_el.childElementCount > 0) {
                ability_sloupec_el.children[0].remove();
            }

            //Přidání bodů, protihráčovi nebo hráčovi
            if (el.classList.contains("protihrac_karty")) {
                let hrac_body_int = Number(document.getElementById("hrac_body").innerHTML);
                hrac_body_int += debuff_karta_objekt.body;
                document.getElementById("hrac_body").innerHTML = hrac_body_int;
            }
            else {
                let protihrac_body_int = Number(document.getElementById("protihrac_body").innerHTML);
                protihrac_body_int += debuff_karta_objekt.body;
                document.getElementById("protihrac_body").innerHTML = protihrac_body_int;
            }

            //Smazání samotné postavy
            el.remove();

            //Upravit, aby to fungovalo na hráče i protihráče.
            if (rodic.classList.contains("protivnik_prazdne_misto")) { //Protihráč
                protihrac_prostredek_prazdne_misto.push(rodic.id);

                // Odstranění z pole (najdeme si index znovu, protože to mohla být tvoje nebo soupeřova karta)
                let smazat_index = protihrac_prostredek_objekty_karty.findIndex(k => k.id === debuff_karta_objekt.id);
                if (smazat_index > -1) {
                    protihrac_prostredek_objekty_karty.splice(smazat_index, 1);
                }
            }
            else { //Hráč
                // Odstranění z pole (najdeme si index znovu, protože to mohla být tvoje nebo soupeřova karta)
                let smazat_index = hrac_prostredek_objekty_karty.findIndex(k => k.id === debuff_karta_objekt.id);
                if (smazat_index > -1) {
                    hrac_prostredek_objekty_karty.splice(smazat_index, 1);
                }
            }

        }
    }
}


function prohledani_karet_uprostred_ability() {
    if (hraje_hrac) {
        for (let i = protihrac_prostredek_objekty_karty.length - 1; i >= 0; i--) {
            pouziti_debuffu(protihrac_prostredek_objekty_karty[i]);
        }
    }
    else {
        for (let i = hrac_prostredek_objekty_karty.length - 1; i >= 0; i--) {
            pouziti_debuffu(hrac_prostredek_objekty_karty[i]);
        }
    }
}

function prirazeni_ability_id(ability) {
    pocitadlo_id_abilitek++;
    return ability + pocitadlo_id_abilitek;
}

//Fungování abilitek karet nademnou

function kamen_nuzky_papir(utocici_karta_objekt, cilova_karta_objekt) {
    if (utocici_karta_objekt.dmg < 0)
        return 1;
    switch (utocici_karta_objekt.trida) {
        case "Magic":
            switch (cilova_karta_objekt.trida) {
                case "Heavy": return 2;
                case "Light": return 0.5;
                default: return 1;
            }break;
        case "Heavy":
            switch (cilova_karta_objekt.trida) {
                case "Magic": return 0.5;
                case "Light": return 2;
                default: return 1;
            }break;
        case "Light":
            switch (cilova_karta_objekt.trida) {
                case "Heavy": return 0.5;
                case "Magic": return 2;
                default: return 1;
            }break;
        default: return 1;
    }
    return 1;
}

function Vytvoreni_krizku(){
    const krizek = document.createElement("img");
        krizek.classList.add("krizek");
        krizek.src="./Obrazky/krizek.png";
        krizek.style.cursor="pointer";
        krizek.addEventListener("click",
            function(){
                const obrazek_karty_id = krizek.parentElement.firstChild.id;
                let index_obj_inv_vymaz;
                for(let i =0;i<hrac_inventar_objekty_karty.length;i++){
                    if(hrac_inventar_objekty_karty[i].id === obrazek_karty_id){
                        index_obj_inv_vymaz = i;
                    }
                    else{
                        //Vymazání křížků u karet, protože lže za kolo smazat jen jedna karta
                        let karta_img = document.getElementById(hrac_inventar_objekty_karty[i].id);
                        let krizek_ke_smazani = karta_img.parentElement.querySelector(".krizek");
                        if(krizek_ke_smazani)
                            krizek_ke_smazani.remove();
                    }
                }
                if(index_obj_inv_vymaz!=null)
                    hrac_inventar_objekty_karty.splice(index_obj_inv_vymaz,1);
                else
                    return -1;
                krizek.parentElement.remove();
                
                //Zpřístupnění tlačítka pro přidávání karet, pokud jsou ještě karty v paklíku
                if (pocet_karet_v_pakliku_hrac>0) {
                    let tlacitko_pridani = document.getElementById("pridavani_karet");
                    tlacitko_pridani.classList.add("clickable");
                    tlacitko_pridani.onclick = function () { pridani_karty("hrac"); };
                }

                byl_pouzit_krizek=true;
            }
        );
    return krizek;
}

function posunuti_rucicky(misto_spusteni){
    switch(misto_spusteni)
    {
        case "potvrzeni_tahu":
                uhel_rucicky=180;break;
        case "protihrac_posledni":
                uhel_rucicky=360;break;
        case "zruseni_tahu": 
                uhel_rucicky-=45;break;

        default: uhel_rucicky+=45;
    }
    document.getElementById("hodinova_rucicka").style.rotate=uhel_rucicky+"deg";
}

function nekromancer_ability(element_img,napravo,nalevo){
    let id_rodice = element_img.parentElement.id;
    let poradi_v_poli = id_rodice[element_img.parentElement.id.length-1];
    let id_rodice_bez_cisla = id_rodice.substring(0,id_rodice.length-1);
    if (parseInt(poradi_v_poli, 10) - 1 > 0 && 
    document.getElementById(id_rodice_bez_cisla + (parseInt(poradi_v_poli, 10) - 1)).children.length === 0&&
    nalevo){
        let prazdne_misto = document.getElementById(id_rodice_bez_cisla+(parseInt(poradi_v_poli, 10) - 1));
        let nova_karta_objekt = structuredClone(Skeleton);
        nova_karta_objekt.id = vygeneruj_nove_id();
        const img = document.createElement("img");
        img.id = nova_karta_objekt.id;
        img.src = nova_karta_objekt.img;
        if(id_rodice_bez_cisla=="hrac_pole_karta"){
            hrac_prostredek_objekty_karty.push(nova_karta_objekt);
            img.onclick = function () { utok(this); };
            img.classList.add("karty","clickable");
        }  
        else{
            protihrac_prostredek_objekty_karty.push(nova_karta_objekt);
            img.classList.add("protihrac_karty");
        }
        prazdne_misto.appendChild(img);
    }
    if (parseInt(poradi_v_poli, 10) + 1< 5 && 
       document.getElementById(id_rodice_bez_cisla + (parseInt(poradi_v_poli, 10) + 1)).children.length === 0&&
        napravo){
        let prazdne_misto = document.getElementById(id_rodice_bez_cisla+(parseInt(poradi_v_poli, 10) + 1));
        let nova_karta_objekt = structuredClone(Skeleton);
        nova_karta_objekt.id = vygeneruj_nove_id();
        const img = document.createElement("img");
        img.id = nova_karta_objekt.id;
        img.src = nova_karta_objekt.img;
        if(id_rodice_bez_cisla=="hrac_pole_karta"){
            hrac_prostredek_objekty_karty.push(nova_karta_objekt);
            img.onclick = function () { utok(this); };
            img.classList.add("karty","clickable");
        }  
        else{
            protihrac_prostredek_objekty_karty.push(nova_karta_objekt);
            img.classList.add("protihrac_karty");
        }
        prazdne_misto.appendChild(img);
    }
}
function nekromancer_misto_napravo(element_mista_pro_kartu){
    let id_rodice = element_mista_pro_kartu.id;
    let poradi_v_poli = id_rodice[element_mista_pro_kartu.id.length-1];
    let id_rodice_bez_cisla = id_rodice.substring(0,id_rodice.length-1);
    let prazdne_misto_napravo = document.getElementById(id_rodice_bez_cisla + (parseInt(poradi_v_poli, 10) + 1));
    if((parseInt(poradi_v_poli, 10) + 1)>4)
        return;
        if (prazdne_misto_napravo.classList.contains("prvni_ramecek") || prazdne_misto_napravo.classList.contains("druhy_ramecek") || prazdne_misto_napravo.classList.contains("treti_ramecek")) {
        return false;
        }
        return true;
}
function nekromancer_misto_nalevo(element_mista_pro_kartu){
    let id_rodice = element_mista_pro_kartu.id;
    let poradi_v_poli = id_rodice[element_mista_pro_kartu.id.length-1];
    let id_rodice_bez_cisla = id_rodice.substring(0,id_rodice.length-1);
    let prazdne_misto_napravo = document.getElementById(id_rodice_bez_cisla + (parseInt(poradi_v_poli, 10) - 1));
    if((parseInt(poradi_v_poli, 10) - 1)<=0)
        return;
        if (prazdne_misto_napravo.classList.contains("prvni_ramecek") || prazdne_misto_napravo.classList.contains("druhy_ramecek") || prazdne_misto_napravo.classList.contains("treti_ramecek")) {
        return false;
        }
        return true;
}

// Přidán parametr 'prirazen_ramecek'
function Vytvoreni_zruseni_tahu(akce, prirazen_ramecek = null) {
    const zruseni_tahu = document.createElement("img");
    zruseni_tahu.classList.add("zruseni_tahu");
    zruseni_tahu.src = "./Obrazky/vraceni_zpet.png";

    // Uložíme si přesný rámeček do paměti tohoto konkrétního tlačítka!
    if (prirazen_ramecek) {
        zruseni_tahu.dataset.ramecek = prirazen_ramecek;
    }

    zruseni_tahu.addEventListener("click", function (e) {
        e.stopPropagation();

        let element_karty;
        // ... tvoje původní hledání elementu karty (for cyklus a if) ...
        for (let i = 0; i < this.parentElement.children.length; i++) {
            if (this.parentElement.children[i].classList.contains("karty")) {
                element_karty = this.parentElement.children[i];
                break;
            }
        }
        if (!element_karty) {
            if(this.parentElement.id != "obal_pridavani_karet") return;
            element_karty = document.getElementById("pridavani_karet");
        }
        
        let odebrany_ramecek = "";

        // =========================================================
        // OPRAVENÉ HLEDÁNÍ RÁMEČKU (Už nebude hádat)
        // =========================================================
        if (this.dataset.ramecek) {
            // Tlačítko přesně ví, pro jaký rámeček bylo vytvořeno
            odebrany_ramecek = this.dataset.ramecek;
        } else if (akce === "lizani") {
            // Lízání zůstává stejné
            let balicek_img = document.getElementById("pridavani_karet");
            let historie = balicek_img.dataset.historieRamecku;
            if (historie) {
                let pole_historie = historie.split(",");
                odebrany_ramecek = pole_historie[pole_historie.length - 1];
            }
        } else {
            // Pojistka, kdyby něco (tvoje stará logika)
            if (element_karty.classList.contains("prvni_ramecek")) odebrany_ramecek = "prvni_ramecek";
            else if (element_karty.classList.contains("druhy_ramecek")) odebrany_ramecek = "druhy_ramecek";
            else if (element_karty.classList.contains("treti_ramecek")) odebrany_ramecek = "treti_ramecek";
        }

        // Smazání naplánovaného tahu globálně na základě zjištěného rámečku
        if (odebrany_ramecek === "prvni_ramecek") {
            prvni_tah = null;
        } else if (odebrany_ramecek === "druhy_ramecek") {
            druhy_tah = null;
        } else if (odebrany_ramecek === "treti_ramecek") {
            treti_tah = null;
        }

        console.log("Ruším rámeček: " + odebrany_ramecek + " u elementu:", element_karty);

        if (odebrany_ramecek === "") {
            console.log("Program nedokázal zjistit, jaký rámeček karta má.");
            return;
        }
        // =========================================================================

        // 2. SPOLEČNÉ VRÁCENÍ (Čas, body a smazání rámečku ze zdroje)
        pocet_tahu++;
        posunuti_rucicky("zruseni_tahu");
        document.getElementById("text_ukazatel_tahu").innerHTML = "Počet tahů: <br>" + pocet_tahu;
        
        if (pocet_tahu === 3) {
            document.getElementById("konecTahu").classList.remove("clickable");
        }

        element_karty.classList.remove(odebrany_ramecek); // Smaže rámeček ze zdroje
        vybrane_karty_index--; 

        // --- 3. ROZDĚLENÍ LOGIKY PODLE TOHO, CO SE RUŠÍ ---
        if (akce === "presunuti") {
            pomocne_pocitadlo_karet_v_inv++;
            
            let hracovo_pole_prazdnych_mist = document.getElementById("pole_vykladani_hrace");
            let pole_element_s_rameckem = hracovo_pole_prazdnych_mist.getElementsByClassName(odebrany_ramecek);
            if (pole_element_s_rameckem.length > 0) {
                pole_element_s_rameckem[0].classList.remove(odebrany_ramecek); 
            }

            if(!byl_pouzit_krizek){//Tady je problém s tím křížkem, protože když ho použiju, tak pak se tam neukáže to zrušení tahu.
                element_karty.parentElement.appendChild(Vytvoreni_krizku());
            }
            element_karty.parentElement.classList.remove("zakliknuta_v_identu");

            console.log("Hráč inventář objekty karty: " + hrac_inventar_objekty_karty.length);
            console.log("Pomocné počítadlo karet v inv: " + pomocne_pocitadlo_karet_v_inv);

            // ZDE DEFINUJEME PROMĚNNOU (Musí být přesně takto před while cyklem!)
            let balicek_img = document.getElementById("pridavani_karet");
            
            // AUTOMATICKÉ ZRUŠENÍ LÍZÁNÍ, POKUD JE KARET VÍCE NEŽ 5
            while (hrac_inventar_objekty_karty.length + pomocne_pocitadlo_karet_v_inv > 5) {
                
                let historie = balicek_img.dataset.historieRamecku;
                // Pojistka proti nekonečnému cyklu
                if (!historie) {
                    console.log("Není co zrušit z lízání, přerušuji cyklus.");
                    break;
                }

                let pole_historie = historie.split(",");
                let ramecek_ke_smazani = pole_historie.pop(); // Vezmeme poslední líznutý rámeček

                // 1. Smažeme rámeček z balíčku a vrátíme do oběhu
                balicek_img.classList.remove(ramecek_ke_smazani);
                ramecky_k_pouziti.unshift(ramecek_ke_smazani);

                // 2. Aktualizujeme historii balíčku
                if (pole_historie.length > 0) {
                    balicek_img.dataset.historieRamecku = pole_historie.join(",");
                } else {
                    balicek_img.removeAttribute("data-historie-ramecku");
                }

                // =========================================================================
                // OPRAVA BODU 3: INTELIGENTNÍ MAZÁNÍ ŠIPKY
                // =========================================================================
                // Šipku smažeme JEN tehdy, pokud v historii už NIC NEZBYLO.
                // Pokud v historii ještě nějaký rámeček zbývá (pole_historie.length > 0), 
                // šipku nesmažeme, aby mohl hráč zrušit i to předchozí líznutí!
                if (pole_historie.length === 0) {
                    let obal_balicku = document.getElementById("obal_pridavani_karet");
                    let sipka_k_odstraneni = obal_balicku.querySelector(".zruseni_tahu");
                    if (sipka_k_odstraneni) {
                        sipka_k_odstraneni.remove();
                    }
                }
                // =========================================================================

                // 4. Vrácení pomocných počítadel
                pomocne_pocitadlo_karet_v_inv--;
                vybrane_karty_index--;
                
                // 5. Vrácení karty zpět do balíčku
                pocet_karet_v_pakliku_hrac++;
                document.getElementById("pocitadlo_hrac_text").innerHTML = pocet_karet_v_pakliku_hrac;

                // 6. Vrácení bodu tahu navíc
                pocet_tahu++;
                posunuti_rucicky("zruseni_tahu");
                document.getElementById("text_ukazatel_tahu").innerHTML = "Počet tahů: <br>" + pocet_tahu;
                if (pocet_tahu === 3) {
                    document.getElementById("konecTahu").classList.remove("clickable");
                }

                // 7. Vyčištění globální proměnné tahu
                if (ramecek_ke_smazani === "prvni_ramecek") prvni_tah = null;
                else if (ramecek_ke_smazani === "druhy_ramecek") druhy_tah = null;
                else if (ramecek_ke_smazani === "treti_ramecek") treti_tah = null;
                
                console.log("Automaticky zrušeno lízání, uvolněn rámeček:", ramecek_ke_smazani);
            }

            // Po skončení cyklu vrátíme balíčku funkčnost (pokud klesl počet pod limit)
            if (hrac_inventar_objekty_karty.length + pomocne_pocitadlo_karet_v_inv < 5 && pocet_karet_v_pakliku_hrac > 0) {
                balicek_img.classList.add("clickable");
                balicek_img.onclick = function() { pridani_karty("hrac"); };
            }

       } else if (akce === "utok") {
            // Snížíme index, abychom se podívali na kartu, jejíž tah rušíme
            utocici_karty_objekty_index--; 

            let index_k_vymazani = utocici_karty_objekty_index; 
            if (odebrany_ramecek === "prvni_ramecek") index_k_vymazani = 0;
            else if (odebrany_ramecek === "druhy_ramecek") index_k_vymazani = 1;
            else if (odebrany_ramecek === "treti_ramecek") index_k_vymazani = 2;
            
            // --- TENTO ŘÁDEK TADY CHYBĚL A OPRAVUJE TVOU CHYBU ---
            utocici_karty_objekty[utocici_karty_objekty_index] = null; // Vyčistíme starou kartu z paměti útoků
            pomocne_pole_pri_healovani = [];

            // Odstranění rámečku z cílené karty nebo místa
            let cilovy_element = document.querySelector("." + odebrany_ramecek);
            if (cilovy_element) {
                cilovy_element.classList.remove(odebrany_ramecek);
            }
            // Karta může být znovu zakliknuta
            element_karty.classList.add("clickable");
            element_karty.onclick = function () { utok(this); };

            
            // Nalezení objektu karty (může být na stole i v inventáři)
            let objekt_karty = hrac_prostredek_objekty_karty.find(k => k.id === element_karty.id) || 
                               hrac_inventar_objekty_karty.find(k => k.id === element_karty.id);
            
            if (objekt_karty) {
                if(objekt_karty.trida==="Spell")
                {
                    if(objekt_karty.dmg<0)  //Když healuje a zároveň je spell, tak to znamená, že to používá na kartu, která je na středu hráče
                    {
                        let objekt_karty_cil = hrac_prostredek_objekty_karty.find(k => k.id === cilovy_element.id);
                        console.log(objekt_karty_cil)
                        if (objekt_karty_cil.dmg > 0) {
                            cilovy_element.onclick = function () { utok(this); };
                        } else {
                            cilovy_element.onclick = function () { healovani(this); };
                        }
                    }
                    console.log(cilovy_element);
                    console.log(cilovy_element.onclick);
                    if(!byl_pouzit_krizek){
                        element_karty.parentElement.appendChild(Vytvoreni_krizku());
                    }
                    element_karty.parentElement.classList.remove("zakliknuta_v_identu");

                    // 1. Oživení karty v inventáři (vrácení animací a prokliku)
                    element_karty.classList.add("vysouvani_karet");
                    element_karty.onclick = function () { nakliknuto(this.id); };
                    console.log(element_karty);
                    if (element_karty.parentElement) {
                        element_karty.parentElement.classList.add("div_hrac_karty_najete");
                    }

                    // Virtuálně vrátíme Spell do ruky, takže nám zabere místo
                    pomocne_pocitadlo_karet_v_inv++;
                    
                    let balicek_img = document.getElementById("pridavani_karet");
                    
                    // Automatické rušení lízání, pokud vrácený Spell způsobil přetečení inventáře
                    while (hrac_inventar_objekty_karty.length + pomocne_pocitadlo_karet_v_inv > 5) {
                        
                        let historie = balicek_img.dataset.historieRamecku;
                        // Pojistka
                        if (!historie) {
                            console.log("Není co zrušit z lízání, přerušuji cyklus u Spellu.");
                            break;
                        }

                        let pole_historie = historie.split(",");
                        let ramecek_ke_smazani = pole_historie.pop(); 

                        // Smažeme rámeček z balíčku a vrátíme do oběhu
                        balicek_img.classList.remove(ramecek_ke_smazani);
                        ramecky_k_pouziti.unshift(ramecek_ke_smazani);

                        // Aktualizujeme historii balíčku
                        if (pole_historie.length > 0) {
                            balicek_img.dataset.historieRamecku = pole_historie.join(",");
                        } else {
                            balicek_img.removeAttribute("data-historie-ramecku");
                            
                            // Smažeme šipku POUZE tehdy, pokud v historii už nic nezbylo
                            let obal_balicku = document.getElementById("obal_pridavani_karet");
                            let sipka_k_odstraneni = obal_balicku.querySelector(".zruseni_tahu");
                            if (sipka_k_odstraneni) {
                                sipka_k_odstraneni.remove();
                            }
                        }

                        // Vrácení pomocných počítadel
                        pomocne_pocitadlo_karet_v_inv--;
                        vybrane_karty_index--;
                        
                        // Vrácení karty zpět do balíčku
                        pocet_karet_v_pakliku_hrac++;
                        document.getElementById("pocitadlo_hrac_text").innerHTML = pocet_karet_v_pakliku_hrac;

                        // Vrácení bodu tahu navíc
                        pocet_tahu++;
                        posunuti_rucicky("zruseni_tahu");
                        document.getElementById("text_ukazatel_tahu").innerHTML = "Počet tahů: <br>" + pocet_tahu;
                        if (pocet_tahu === 3) {
                            document.getElementById("konecTahu").classList.remove("clickable");
                        }

                        // Vyčištění globální proměnné tahu
                        if (ramecek_ke_smazani === "prvni_ramecek") prvni_tah = null;
                        else if (ramecek_ke_smazani === "druhy_ramecek") druhy_tah = null;
                        else if (ramecek_ke_smazani === "treti_ramecek") treti_tah = null;
                        
                        console.log("Automaticky zrušeno lízání (vrácen Spell), uvolněn rámeček:", ramecek_ke_smazani);
                    }

                    // Po skončení cyklu vrátíme balíčku funkčnost (pokud klesl počet pod limit)
                    if (hrac_inventar_objekty_karty.length + pomocne_pocitadlo_karet_v_inv < 5 && pocet_karet_v_pakliku_hrac > 0) {
                        balicek_img.classList.add("clickable");
                        balicek_img.onclick = function() { pridani_karty("hrac"); };
                    }
                }
            }
       } else if (akce === "lizani") {
            let balicek_img = document.getElementById("pridavani_karet");
            
            let historie = balicek_img.dataset.historieRamecku;
            if (!historie) return; 
            
            let pole_historie = historie.split(",");
            let ramecek_ke_smazani = pole_historie.pop(); 
            
            balicek_img.classList.remove(ramecek_ke_smazani);
            ramecky_k_pouziti.unshift(ramecek_ke_smazani);
            
            if (pole_historie.length > 0) {
                balicek_img.dataset.historieRamecku = pole_historie.join(",");
                
                setTimeout(() => {
                    let obal_balicku = document.getElementById("obal_pridavani_karet");
                    let existujici_sipka = obal_balicku.querySelector(".zruseni_tahu");
                    if (!existujici_sipka) {
                        let tlacitko_zpet = Vytvoreni_zruseni_tahu("lizani");
                        obal_balicku.appendChild(tlacitko_zpet);
                    }
                }, 1);

            } else {
                balicek_img.removeAttribute("data-historie-ramecku");
            }

            pomocne_pocitadlo_karet_v_inv--;
            vybrane_karty_index--;
            
            pocet_karet_v_pakliku_hrac++;
            document.getElementById("pocitadlo_hrac_text").innerHTML = pocet_karet_v_pakliku_hrac;

            balicek_img.classList.add("clickable");
            balicek_img.onclick = function() { pridani_karty("hrac"); };
        }

        // 4. PŘEPOČÍTÁNÍ KAPACITY INVENTÁŘE
        let virtualni_pocet_karet = hrac_inventar_objekty_karty.length + pomocne_pocitadlo_karet_v_inv;
        let tlacitko_pridavani = document.getElementById("pridavani_karet");

        if (virtualni_pocet_karet >= 5) {
            tlacitko_pridavani.classList.remove("clickable");
            tlacitko_pridavani.onclick = null;
        } else if (pocet_karet_v_pakliku_hrac > 0) {
            tlacitko_pridavani.classList.add("clickable");
            tlacitko_pridavani.onclick = function () { pridani_karty("hrac"); };
        }

// 5. SMAZÁNÍ TLAČÍTKA ZRUŠENÍ TAHU
        this.remove();

        // 6. ÚKLID RÁMEČKU DO OBĚHU
        if (akce !== "lizani") {
            ramecky_k_pouziti.push(odebrany_ramecek);
            const priorita_ramecku = { "prvni_ramecek": 1, "druhy_ramecek": 2, "treti_ramecek": 3 };
            ramecky_k_pouziti.sort((a, b) => priorita_ramecku[a] - priorita_ramecku[b]);
        }

        // =========================================================
        // 7. OBNOVENÍ KLIKATELNOSTI KARET NA STOLE PO ZRUŠENÍ TAHU
        // =========================================================
        hrac_prostredek_objekty_karty.forEach(objekt => {
            let karta_element = document.getElementById(objekt.id);
            
            // Pokud karta fyzicky na stole existuje
            if (karta_element) {
                karta_element.classList.add("clickable"); // Vrátíme kurzor ručičky
                
                // Zjistíme z objektu, jakou funkci má karta mít (podle toho, jestli je to útočník nebo healer)
                if (objekt.dmg > 0) {
                    karta_element.onclick = function () { utok(this); };
                } else {
                    karta_element.onclick = function () { healovani(this); };
                }
            }
        });
        
    }); // Konec události onclick pro zrušení tahu
    
    return zruseni_tahu;
    } // Konec celé funkce Vytvoreni_zruseni_tahu