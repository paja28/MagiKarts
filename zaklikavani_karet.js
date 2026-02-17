// --- GLOBÁLNÍ PROMĚNNÉ ---
var je_zakliknuta_karta = false;
var zakliknuta_karta_id = null;

// ZMĚNA: Místo pevných polí s ID použijeme počítadlo. 
// Tím pádem nám nikdy nedojdou IDčka pro nové karty.
var pocitadlo_id_karet = 0; 

// Tyto pole už nepotřebujeme pro generování ID, ale pro sloty na stole ano:
var protihrac_prostredek_prazdne_misto = ["protihrac_pole_karta1", "protihrac_pole_karta2", "protihrac_pole_karta3", "protihrac_pole_karta4"];
var protihrac_prostredek_karty = []; // Tady budeme držet ID karet na středu

// Inventáře a pole na stole
var protihrac_inventar_objekty_karty = [];
var protihrac_prostredek_objekty_karty = [];

// Objekty
var pole_karet = [Lucistnik, Bojovnik, Carodej, Spartan, Fireball];

var hrac_inventar_objekty_karty = [];
var hrac_prostredek_objekty_karty = [];

var utocici_karta_objekt = null;
var byvala_zakliknuta_karta_id = "";
var pocet_kol = 1;
var pocet_tahu = 3;
var hraje_hrac = true;

// --- HLAVNÍ FUNKCE ---

window.onload = function() {
    // Rozdání počátečních karet
    for (let i = 0; i < 5; i++) {
        pridani_karty("hrac");
        // Resetujeme tahy, protože přidání karty při startu je nebere
        pocet_tahu = 3; 
        pridani_karty("protihrac");
    }
    console.log("Hra připravena!");
}

// Pomocná funkce pro unikátní ID
function vygeneruj_nove_id() {
    pocitadlo_id_karet++;
    return "karta_" + pocitadlo_id_karet;
}

function nakliknuto(id) {
    // Pokud nehraje hráč, neměl by mít možnost klikat (pokud to není obrana)
    if (!hraje_hrac && pocet_tahu <= 0) return;

    let karta = document.getElementById(id);
    let prazdna_mista;

    if (!je_zakliknuta_karta) {
        // 1. Situace: Nic není vybráno, vybírám kartu
        je_zakliknuta_karta = true;
        zakliknuta_karta_id = id;
        
        karta.classList.add("zakliknuta_karta");
        karta.classList.remove("vysouvani_karet");

        // Zvýraznění prázdných míst
        prazdna_mista = document.querySelectorAll(".prazdne_misto");
        prazdna_mista.forEach(misto => {
            misto.classList.add("clickable");
            // Používám novější zápis funkce onlick, je to bezpečnější než string
            misto.onclick = function() { presunuti_karty(this.id); };
        });

    } else {
        // 2. Situace: Už mám něco vybráno
        if (zakliknuta_karta_id === id) {
            // Klikl jsem na tu samou kartu -> Odznačit
            je_zakliknuta_karta = false;
            karta.classList.remove("zakliknuta_karta");
            
            byvala_zakliknuta_karta_id = zakliknuta_karta_id;
            zakliknuta_karta_id = null;

            // Zrušit zvýraznění míst
            prazdna_mista = document.querySelectorAll(".prazdne_misto");
            prazdna_mista.forEach(misto => {
                misto.classList.remove("clickable");
                misto.onclick = null;
            });

            // Malý fix animace
            setTimeout(function() {
                if (byvala_zakliknuta_karta_id !== zakliknuta_karta_id)
                    karta.classList.add("vysouvani_karet");
            }, 200);

        } else {
            // Klikl jsem na JINOU kartu -> Přepnout výběr
            document.getElementById(zakliknuta_karta_id).classList.add("vysouvani_karet");
            document.getElementById(zakliknuta_karta_id).classList.remove("zakliknuta_karta");

            je_zakliknuta_karta = true;
            byvala_zakliknuta_karta_id = zakliknuta_karta_id;
            zakliknuta_karta_id = id;

            karta.classList.add("zakliknuta_karta");
            karta.classList.remove("vysouvani_karet");
            // Místa jsou už aktivní z minula, nemusíme znovu nastavovat
        }
    }
}

function presunuti_karty(id_prazdneho_mista) {
    if (zakliknuta_karta_id != null) {
        if (pocet_tahu <= 0) {
            console.log("Nemáš dost tahů!");
            return;
        }

        pocet_tahu--;
        
        const presunuta_karta_element = document.getElementById(zakliknuta_karta_id);
        const cilove_misto = document.getElementById(id_prazdneho_mista);
        
        // --- LOGIKA DAT ---
        // Najdeme kartu v inventáři a přesuneme ji do pole "na stole"
        let index_nalezene_karty = -1;
        for (let i = 0; i < hrac_inventar_objekty_karty.length; i++) {
            if (hrac_inventar_objekty_karty[i].id === zakliknuta_karta_id) {
                index_nalezene_karty = i;
                break;
            }
        }

        if (index_nalezene_karty > -1) {
            // Přesun objektu z inventáře na stůl
            let objekt_karty = hrac_inventar_objekty_karty[index_nalezene_karty];
            hrac_prostredek_objekty_karty.push(objekt_karty);
            hrac_inventar_objekty_karty.splice(index_nalezene_karty, 1);
        }

        // --- LOGIKA ZOBRAZENÍ (DOM) ---
        // OPRAVA: Nemusíme mazat a znovu vytvářet. Stačí element přesunout (append ho sebere z původního místa).
        // Také je lepší neměnit ID karty, aby zůstala unikátní.
        
        presunuta_karta_element.classList.remove("zakliknuta_karta");
        presunuta_karta_element.classList.remove("vysouvani_karet");
        presunuta_karta_element.onclick = function() { utok(this); }; // this odkazuje na element
        
        // Zrušíme prázdné místo (nebo do něj vložíme kartu)
        // Tvůj systém používá "zrušení prázdného místa" a vložení karty.
        // Aby se nerozbilo ID slotu, uděláme to takto:
        cilove_misto.innerHTML = ""; // Vyčistíme text "Prázdné místo"
        cilove_misto.appendChild(presunuta_karta_element);
        cilove_misto.classList.remove("clickable");
        cilove_misto.onclick = null; // Už nejde kliknout jako na prázdné místo

        // Povolení tlačítka pro přidání karet
        let tlacitko_pridani = document.getElementById("pridavani_karet");
        if (!tlacitko_pridani.classList.contains("clickable")) {
             tlacitko_pridani.classList.add("clickable");
             tlacitko_pridani.onclick = function() { pridani_karty("hrac"); };
        }

        // Reset stavu
        je_zakliknuta_karta = false;
        zakliknuta_karta_id = null;

        // Vypnutí ostatních prázdných míst
        let prazdna_mista = document.querySelectorAll(".prazdne_misto");
        prazdna_mista.forEach(m => {
            m.classList.remove("clickable");
            m.onclick = null;
        });

        // Konec tahu hráče -> hraje PC? Záleží na pravidlech, zatím voláme logiku PC
        protihrac_vybrani_random_karty();
    }
}

function pridani_karty(hrac_nebo_protihrac) {
    // Zjistíme, jestli má hráč/protihráč místo v ruce
    let inventar = (hrac_nebo_protihrac === "hrac") ? hrac_inventar_objekty_karty : protihrac_inventar_objekty_karty;
    
    if (inventar.length >= 5) {
        console.log(hrac_nebo_protihrac + " má plný inventář.");
        return;
    }

    // Výběr náhodné karty ze šablony
    let random_index = Math.floor(Math.random() * pole_karet.length);
    // Vytvoření kopie objektu
    let nova_karta_objekt = { ...pole_karet[random_index] };
    
    // ZMĚNA: Generování nového ID
    nova_karta_objekt.id = vygeneruj_nove_id(); 

    // Uložení do pole objektů
    if (hrac_nebo_protihrac === "hrac") {
        hrac_inventar_objekty_karty.push(nova_karta_objekt);
        if (pocet_kol > 1) pocet_tahu--; // Odečíst tah jen pokud to není start hry
    } else {
        protihrac_inventar_objekty_karty.push(nova_karta_objekt);
    }

    // Vytvoření obrázku (DOM)
    const kontejner = document.getElementById(hrac_nebo_protihrac === "hrac" ? "hracovy_karty" : "protihracovy_karty");
    const img = document.createElement("img");
    img.id = nova_karta_objekt.id;
    img.src = nova_karta_objekt.img;
    img.classList.add("karty");

    if (hrac_nebo_protihrac === "hrac") {
        img.classList.add("vysouvani_karet", "clickable");
        img.onclick = function() { nakliknuto(this.id); };
        
        // Pokud má hráč plno, vypneme tlačítko
        if (hrac_inventar_objekty_karty.length >= 5) {
            let btn = document.getElementById("pridavani_karet");
            btn.classList.remove("clickable");
            btn.onclick = null;
        }
    }

    kontejner.appendChild(img);
}

// --- LOGIKA PROTIHRÁČE ---

function protihrac_vybrani_random_karty() {
    // Kontrola, zda může vynést (má místo a má karty)
    if (protihrac_prostredek_objekty_karty.length < 4 && protihrac_inventar_objekty_karty.length > 0) {
        console.log("Protihráč vybírá kartu...");
        let random = Math.floor(Math.random() * protihrac_inventar_objekty_karty.length);
        let vybrana_objekt = protihrac_inventar_objekty_karty[random];
        let karta_element = document.getElementById(vybrana_objekt.id);
        
        karta_element.classList.add("vysouvani_karet_protihrace");
        setTimeout(() => protihrac_presunuti_karty(vybrana_objekt.id), 1000);
    }
}

function protihrac_presunuti_karty(id_karty) {
    if (protihrac_prostredek_prazdne_misto.length > 0) {
        // Najdi objekt v inventáři
        let index = protihrac_inventar_objekty_karty.findIndex(k => k.id === id_karty);
        if (index === -1) return; // Chyba, karta nenalezena

        let objekt = protihrac_inventar_objekty_karty[index];
        
        // Přesun v datech
        protihrac_inventar_objekty_karty.splice(index, 1);
        protihrac_prostredek_objekty_karty.push(objekt);

        // Přesun v grafice
        let slot_id = protihrac_prostredek_prazdne_misto.shift(); // Vezme první volný slot
        let slot_element = document.getElementById(slot_id);
        let karta_element = document.getElementById(id_karty);

        karta_element.classList.remove("vysouvani_karet_protihrace");
        slot_element.innerHTML = ""; // Smazat "Prázdné místo"
        slot_element.appendChild(karta_element);
    }
}

// --- BOJ ---

function utok(karta_element_nebo_id) {
    // Získáme ID (pokud je předán element, vezmeme jeho ID)
    let utocnik_id = (karta_element_nebo_id instanceof Element) ? karta_element_nebo_id.id : karta_element_nebo_id;

    // Najdeme útočící kartu v poli hráče
    utocici_karta_objekt = hrac_prostredek_objekty_karty.find(k => k.id === utocnik_id);
    
    if (!utocici_karta_objekt) {
        console.log("Chyba: Útočící karta nenalezena v poli hráče.");
        return;
    }

    console.log("Vybrán útočník:", utocici_karta_objekt);

    // Nastavíme karty protihráče jako cíle
    protihrac_prostredek_objekty_karty.forEach(objekt => {
        let el = document.getElementById(objekt.id);
        if (el) {
            el.classList.add("clickable", "cerveny_ramecek"); // Přidej si CSS class cerveny_ramecek pro efekt
            el.onclick = function() { snizeni_hp(objekt.id); }; // Předáváme ID cíle
        }
    });
}

function snizeni_hp(cil_id) {
    if (hraje_hrac) {
        // --- HRÁČ ÚTOČÍ NA PROTIHRÁČE ---
        if (pocet_tahu <= 0) return;
        pocet_tahu--;

        let index_cile = protihrac_prostredek_objekty_karty.findIndex(k => k.id === cil_id);
        if (index_cile === -1) return;

        let cilovy_objekt = protihrac_prostredek_objekty_karty[index_cile];
        
        // Výpočet poškození
        cilovy_objekt.hp -= utocici_karta_objekt.dmg;
        console.log(`Zásah! Karta ${cil_id} má nyní ${cilovy_objekt.hp} HP.`);

        // Kontrola smrti karty
        if (cilovy_objekt.hp <= 0) {
            let el = document.getElementById(cil_id);
            // Vrátíme slot do původního stavu
            let rodic = el.parentElement;
            el.remove();
            rodic.innerHTML = "Prázdné místo";
            protihrac_prostredek_prazdne_misto.push(rodic.id); // Vrátíme ID slotu do pole volných
            
            // Odstranění z pole objektů
            protihrac_prostredek_objekty_karty.splice(index_cile, 1);
        }

        // Konec tahu hráče -> Start tahu AI
        hraje_hrac = false;
        
        // Vyčistit click listenery na kartách protihráče
        protihrac_prostredek_objekty_karty.forEach(obj => {
            let el = document.getElementById(obj.id);
            if(el) {
                el.classList.remove("clickable", "cerveny_ramecek");
                el.onclick = null;
            }
        });

        protihrac_random_tahy();

    } else {
        // --- PROTIHRÁČ ÚTOČÍ NA HRÁČE (AI LOGIKA) ---
        // Zde cil_id je ID karty HRÁČE, na kterou útočí AI
        // A musíme vědět, KDO z AI karet útočil. To nám musí poslat funkce protihrac_random_tahy
        // Upravíme funkci tak, aby přijímala i utocnika, pokud hraje AI.
    }
}

// Speciální verze funkce pro AI útok, aby to bylo přehlednější
function proved_utok_ai(utocnik_objekt, obrance_objekt) {
    console.log(`AI útočí s ${utocnik_objekt.id} na tvoji ${obrance_objekt.id}`);
    
    obrance_objekt.hp -= utocnik_objekt.dmg;
    
    if (obrance_objekt.hp <= 0) {
        console.log("Tvoje karta zemřela!");
        let el = document.getElementById(obrance_objekt.id);
        let rodic = el.parentElement;
        el.remove();
        rodic.innerHTML = "Prázdné_místo"; // Nebo tam dát zpátky prázdný div, záleží na tvém HTML
        
        // Najít a smazat z pole
        let index = hrac_prostredek_objekty_karty.indexOf(obrance_objekt);
        if (index > -1) hrac_prostredek_objekty_karty.splice(index, 1);
        
        // Zde bys měl asi řešit vytvoření prázdného místa pro hráče, 
        // aby tam mohl dát novou kartu. (Vrátit <div class="prazdne_misto">...</div>)
        let nove_misto = document.createElement("div");
        nove_misto.className = "prazdne_misto";
        nove_misto.id = rodic.id; // Použijeme ID rodiče nebo vygenerujeme nové
        // Poznámka: Tady to záleží na tom, jak máš udělaný layout v HTML.
    }
}


async function protihrac_random_tahy() {
    let protihrac_tahy = 3;
    console.log("--- Začíná tah protihráče ---");

    while (protihrac_tahy > 0) {
        await pauza(1500); // Pauza mezi tahy, aby to nebylo hned
        
        let akce = Math.floor(Math.random() * 3); // 0 = Vyložit, 1 = Líznout, 2 = Útok
        
        // Zjednodušená logika rozhodování
        let muze_vylozit = protihrac_prostredek_objekty_karty.length < 4 && protihrac_inventar_objekty_karty.length > 0;
        let muze_liznout = protihrac_inventar_objekty_karty.length < 5;
        let muze_utocit = protihrac_prostredek_objekty_karty.length > 0 && hrac_prostredek_objekty_karty.length > 0;

        // Pokud padne akce, kterou nelze provést, zkusíme jinou (jednoduchý fallback)
        if (akce === 0 && !muze_vylozit) akce = 1;
        if (akce === 1 && !muze_liznout) akce = 2;
        if (akce === 2 && !muze_utocit) akce = 0;
        
        // Pokud ani po fallbacku nejde, zkusíme první možnou
        if (akce === 0 && !muze_vylozit) akce = 1; 

        console.log(`AI Akce: ${akce} (Zbývá tahů: ${protihrac_tahy})`);

        switch (akce) {
            case 0: // Vyložit kartu
                if (muze_vylozit) {
                    protihrac_vybrani_random_karty();
                } else {
                    console.log("AI chtěla vyložit, ale nemůže.");
                    protihrac_tahy++; // Vrátíme tah, ať zkusí něco jiného v dalším loopu (pozor na nekonečný cyklus, ale tady je await)
                }
                break;

            case 1: // Líznout kartu
                if (muze_liznout) {
                    pridani_karty("protihrac");
                } else {
                     // Nemůže líznout, tah propadá nebo zkusí útok
                }
                break;

            case 2: // Útok
                if (muze_utocit) {
                    let rand_moje = Math.floor(Math.random() * protihrac_prostredek_objekty_karty.length);
                    let rand_tvoje = Math.floor(Math.random() * hrac_prostredek_objekty_karty.length);
                    
                    let utocnik = protihrac_prostredek_objekty_karty[rand_moje];
                    let obrance = hrac_prostredek_objekty_karty[rand_tvoje];

                    proved_utok_ai(utocnik, obrance);
                } else {
                    console.log("AI chtěla útočit, ale není na co/čím.");
                }
                break;
        }
        protihrac_tahy--;
    }

    console.log("Protihráč dohrál.");
    pocet_kol++;
    hraje_hrac = true;
    pocet_tahu = 3; // Reset tahů hráče
    console.log("Jsi na řadě! Tahy: " + pocet_tahu);
}

// Jednoduchá funkce pro čekání
function pauza(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}