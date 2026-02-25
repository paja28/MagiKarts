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
var pole_karet = [Spartan,Mag_ohne,Fireball,Kopinik,Jedovy_sip,Kusnik,Paladin,Leceni];

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
var vybrane_karty_index=0;

//Pro útok hráče
var utocici_karty_objekty = [];
var utocici_karty_objekty_index = 0;

//Pro přidávání karet u hráč
var pomocne_pocitadlo_karet_v_inv = 0; //nemusí být správný počet karet v inventáři
// --- HLAVNÍ FUNKCE ---

window.onload = function() {
    // Rozdání počátečních karet
    spusteni_tahu=true;
    for (let i = 0; i < 5; i++) {
        pridani_karty("hrac");
        // Resetujeme tahy, protože přidání karty při startu je nebere
        pocet_tahu = 3; 
        pridani_karty("protihrac");
    }
    spusteni_tahu=false;
    vybrane_karty_index = 0;
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
        vybrane_karty[vybrane_karty_index]=zakliknuta_karta_id;

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
            vybrane_karty[vybrane_karty_index]= null;

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
            vybrane_karty[vybrane_karty_index]=zakliknuta_karta_id;

            karta.classList.add("zakliknuta_karta");
            karta.classList.remove("vysouvani_karet");
            // Místa jsou už aktivní z minula, nemusíme znovu nastavovat
        }
    }
}

function presunuti_karty(id_prazdneho_mista) {
    const presunuta_karta_element = document.getElementById(vybrane_karty[vybrane_karty_index]);
    const cilove_misto = document.getElementById(id_prazdneho_mista);
if(spusteni_tahu){
    //if (zakliknuta_karta_id != null) {
        
        //Smazání rámečku kolem karet
         //Orámečkování vybrané karty a prázdného místa
        switch(vybrane_karty_index){
            case 0:
                cilove_misto.classList.remove("prvni_ramecek");
                presunuta_karta_element.classList.remove("prvni_ramecek");
                break;
            case 1:
                cilove_misto.classList.remove("druhy_ramecek");
                presunuta_karta_element.classList.remove("druhy_ramecek");
                break;
            case 2:
                cilove_misto.classList.remove("treti_ramecek");
                presunuta_karta_element.classList.remove("treti_ramecek");
                break;
        }

        //

        //

        // --- LOGIKA DAT ---
        // Najdeme kartu v inventáři a přesuneme ji do pole "na stole"
        let index_nalezene_karty = -1;
        for (let i = 0; i < hrac_inventar_objekty_karty.length; i++) {
            if (hrac_inventar_objekty_karty[i].id === vybrane_karty[vybrane_karty_index]) {
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
        //zakliknuta_karta_id = null;

        // Vypnutí ostatních prázdných míst
        let prazdna_mista = document.querySelectorAll(".prazdne_misto");
        prazdna_mista.forEach(m => {
            m.classList.remove("clickable");
            m.onclick = null;
        });

        
       
        vybrane_karty_index++;
    //}
}
else{
    if(pocet_tahu >0){
            //kontrola jestli nehraje protivník
            if(!hraje_hrac)
            {
                console.log("Na tahu je protivník.");
                return
            }
            //Kontrola, jestli hráč nekliká na stejné místo stejnou kartou 2krát
            if(presunuta_karta_element.classList.contains("prvni_ramecek")||presunuta_karta_element.classList.contains("druhy_ramecek")||presunuta_karta_element.classList.contains("treti_ramecek"))
            {
                console.log("Karta už je používána, nejde znovu použít");
                return;
            }
            //Kontrola, jestli hráč nekliká více kartama na již vybrané místo, kam se bude karta přesouvat
            if(cilove_misto.classList.contains("prvni_ramecek")||cilove_misto.classList.contains("druhy_ramecek")||cilove_misto.classList.contains("treti_ramecek"))
            {
                console.log("Cílové místo je už používána, nejde znovu použít");
                return;
            }
            //Kontrola, jestli hráč nekliká kartou na místo, kde se už karta vyskytuje
            if(cilove_misto.childElementCount>0)
            {
                console.log("Cílové místo již má kartu");
                return;
            }

        //Začátek 
        pocet_tahu--;
        console.log("nespustí se, protože hráč nepotvrdil tahy.");
        if(prvni_tah==null){
            prvni_tah=presunuti_karty.bind(null,id_prazdneho_mista);
        }
        else if(druhy_tah==null){
            druhy_tah=presunuti_karty.bind(null,id_prazdneho_mista);
        }
        else if(treti_tah==null){
            treti_tah=presunuti_karty.bind(null,id_prazdneho_mista);
        }

         //Orámečkování vybrané karty a prázdného místa
        switch(vybrane_karty_index){
            case 0:
                cilove_misto.classList.add("prvni_ramecek");
                presunuta_karta_element.classList.add("prvni_ramecek");
                presunuta_karta_element.classList.remove("zakliknuta_karta");
                break;
            case 1:
                cilove_misto.classList.add("druhy_ramecek");
                presunuta_karta_element.classList.add("druhy_ramecek");
                presunuta_karta_element.classList.remove("zakliknuta_karta");
                break;
            case 2:
                cilove_misto.classList.add("treti_ramecek");
                presunuta_karta_element.classList.add("treti_ramecek");
                presunuta_karta_element.classList.remove("zakliknuta_karta");
                break;
        }

        // Zpřístupnění přidání karet
        let tlacitko_pridani = document.getElementById("pridavani_karet");
        if (!tlacitko_pridani.classList.contains("clickable")) {
             tlacitko_pridani.classList.add("clickable");
             tlacitko_pridani.onclick = function() { pridani_karty("hrac"); };
        }

        // Vypnutí ostatních prázdných míst
        je_zakliknuta_karta = false;
        zakliknuta_karta_id = null;

        let prazdna_mista = document.querySelectorAll(".prazdne_misto");
        prazdna_mista.forEach(m => {
            m.classList.remove("clickable");
            m.onclick = null;
        });

        //
        pomocne_pocitadlo_karet_v_inv--;
        vybrane_karty_index++;
    }
    else
        console.log("Hráč už nemá tahy.");
}
}


function pridani_karty(hrac_nebo_protihrac) {
    if(hrac_nebo_protihrac==="hrac"&&spusteni_tahu==false){

        //kontrola jestli nehraje protivník
        if(!hraje_hrac)
        {
            console.log("Na tahu je protivník.");
            return
        }
        if(pocet_tahu >0){
            if(hrac_inventar_objekty_karty.length+pomocne_pocitadlo_karet_v_inv >=5 ){
                console.log("Nelze přidat více karet, nebylo by místo v inventáři");
                return;
            }
        pocet_tahu--;
        console.log("nespustí se, protože hráč nepotvrdil tahy.");
        if(prvni_tah==null){
            prvni_tah=pridani_karty.bind(null,hrac_nebo_protihrac);
            console.log(prvni_tah);
        }
        else if(druhy_tah==null){
            druhy_tah=pridani_karty.bind(null,hrac_nebo_protihrac);
            console.log(druhy_tah);
        }
        else if(treti_tah==null){
            treti_tah=pridani_karty.bind(null,hrac_nebo_protihrac);
            console.log(treti_tah);
        }

        let btn = document.getElementById("pridavani_karet");

         //Orámečkování vybrané karty a prázdného místa
        switch(vybrane_karty_index){
            case 0:
                btn.classList.add("prvni_ramecek");
                break;
            case 1:
                btn.classList.add("druhy_ramecek");
                break;
            case 2:
                btn.classList.add("treti_ramecek");
                break;
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
    let random_index = Math.floor(Math.random() * pole_karet.length);
    // Vytvoření kopie objektu
    let nova_karta_objekt = { ...pole_karet[random_index] };
    
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
    img.classList.add("karty");

    if (hrac_nebo_protihrac === "hrac") {
        img.classList.add("vysouvani_karet", "clickable");
        img.onclick = function() { nakliknuto(this.id); };
        
        // Pokud má hráč plno, vypneme tlačítko
        let btn = document.getElementById("pridavani_karet");
        if (hrac_inventar_objekty_karty.length+pomocne_pocitadlo_karet_v_inv >= 5) {
            btn.classList.remove("clickable");
            btn.onclick = null;
        }

                switch(vybrane_karty_index){
            case 0:
                btn.classList.remove("prvni_ramecek");
                break;
            case 1:
                btn.classList.remove("druhy_ramecek");
                break;
            case 2:
                btn.classList.remove("treti_ramecek");
                break;
        }

        vybrane_karty_index++;
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
    utocici_karty_objekty[utocici_karty_objekty_index] = hrac_prostredek_objekty_karty.find(k => k.id === utocnik_id);
    
    if (!utocici_karty_objekty[utocici_karty_objekty_index]) {
        console.log("Chyba: Útočící karta nenalezena v poli hráče.");
        return;
    }

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
        if(spusteni_tahu){
        // --- HRÁČ ÚTOČÍ NA PROTIHRÁČE ---
        let index_cile = protihrac_prostredek_objekty_karty.findIndex(k => k.id === cil_id.id);
        if (index_cile === -1) return;
        let cilovy_objekt = protihrac_prostredek_objekty_karty[index_cile];
        
        // Výpočet poškození
        
        cilovy_objekt.hp -= utocici_karty_objekty[utocici_karty_objekty_index].dmg;

        // Kontrola smrti karty
        if (cilovy_objekt.hp <= 0) {
            let el = document.getElementById(cil_id.id);
            // Vrátíme slot do původního stavu
            let rodic = el.parentElement;
            el.remove();
            rodic.innerHTML = "Prázdné místo";
            protihrac_prostredek_prazdne_misto.push(rodic.id); // Vrátíme ID slotu do pole volných
            
            // Odstranění z pole objektů
            protihrac_prostredek_objekty_karty.splice(index_cile, 1);
        }
        //maže rámečky u karet protivníka, které nezemřeli.
        else{
            let cil_element = document.getElementById(cil_id.id);
            let utocici_karta_hrace = document.getElementById(utocici_karty_objekty[utocici_karty_objekty_index].id);//Získání karty, kterou hráč útočil
        switch(vybrane_karty_index){
            case 0:
                cil_element.classList.remove("prvni_ramecek");
                utocici_karta_hrace.classList.remove("prvni_ramecek");
                break;
            case 1:
                cil_element.classList.remove("druhy_ramecek");
                utocici_karta_hrace.classList.remove("druhy_ramecek");
                break;
            case 2:
                cil_element.classList.remove("treti_ramecek");
                utocici_karta_hrace.classList.remove("treti_ramecek");
                break;
        }
        }
        
        // Vyčistit click listenery na kartách protihráče
        protihrac_prostredek_objekty_karty.forEach(obj => {
            let el = document.getElementById(obj.id);
            if(el) {
                el.classList.remove("clickable", "cerveny_ramecek");
                el.onclick = null;
            }
        });
        utocici_karty_objekty_index++;
        vybrane_karty_index++;
        }
    else{
        if(pocet_tahu >0){
        pocet_tahu--;
        let cil_element = document.getElementById(cil_id);
        console.log("nespustí se, protože hráč nepotvrdil tahy.");
        if(prvni_tah==null){
            prvni_tah=snizeni_hp.bind(null,cil_element);
            console.log(prvni_tah);
        }
        else if(druhy_tah==null){
            druhy_tah=snizeni_hp.bind(null,cil_element);
            console.log(druhy_tah);
        }
        else if(treti_tah==null){
            treti_tah=snizeni_hp.bind(null,cil_element);
            console.log(treti_tah);
        }

        
         //Orámečkování vybrané karty a prázdného místa
         let utocici_karta_hrace = document.getElementById(utocici_karty_objekty[utocici_karty_objekty_index].id);//Získání karty, kterou hráč útočil
        switch(vybrane_karty_index){
            case 0:
                cil_element.classList.add("prvni_ramecek");
                utocici_karta_hrace.classList.add("prvni_ramecek");
                break;
            case 1:
                cil_element.classList.add("druhy_ramecek");
                utocici_karta_hrace.classList.add("druhy_ramecek");
                break;
            case 2:
                cil_element.classList.add("treti_ramecek");
                utocici_karta_hrace.classList.add("treti_ramecek");
                break;
        }

        

        //
        vybrane_karty_index++;
        utocici_karty_objekty_index++;
    }
    else
        console.log("Hráč už nemá tahy.");
}
    }

    else {
        console.log("Na tahu je protivník.")
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
    hraje_hrac = false;
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
    console.log("Jsi na řadě! Tahy: " + pocet_tahu);
}

// Jednoduchá funkce pro čekání
function pauza(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function potvrzeni_tahu(){
    if(pocet_tahu<3){

    vybrane_karty_index=0;  //Proto aby fungovalo dobře přesouvání karet;

    spusteni_tahu = true;
    console.log("spusteni_tahu prvni_tah");
    utocici_karty_objekty_index=0;  //Aby fungovalo útočení
    prvni_tah();
    prvni_tah=null;
    if(druhy_tah !=null){
        console.log("spusteni_tahu druhy_tah");
        druhy_tah();
        druhy_tah=null;
        if(treti_tah!=null)
        {
            console.log("spusteni_tahu treti_tah");
            treti_tah();
            treti_tah=null;
        }
    }
    protihrac_random_tahy();
    pocet_tahu = 3;
    spusteni_tahu = false;

    //Pro funkční přesouvání karet, útočení a přidávání je to potřeba nullovat
    
    for(let i =0;i<3;i++){
        vybrane_karty[i]=null;
        utocici_karty_objekty[i]=null;
    }
    utocici_karty_objekty_index=0;
    vybrane_karty_index=0;
    pomocne_pocitadlo_karet_v_inv=0;
    }

    //
    else
    {
        console.log("Hráč neudělal ani jeden tah.");
    }
}