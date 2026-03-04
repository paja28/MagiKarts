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
var pole_karet = [Lucistnik,Spartan,Mag_ohne,Fireball,Kopinik,Jedovy_sip,Kusnik,Paladin,Leceni,Lecitel];

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

//Pro hráče
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

        //Získání objketu karty a zjištění, jestli je karta spell
        let zakliknuta_karta_objekt =null;
        for(let i =0;i<hrac_inventar_objekty_karty.length;i++){
            if(zakliknuta_karta_id===hrac_inventar_objekty_karty[i].id)
                zakliknuta_karta_objekt = hrac_inventar_objekty_karty[i];
        }
        if(zakliknuta_karta_objekt.trida=="Spell"){
            spell(zakliknuta_karta_objekt);
            return;
        }


        vybrane_karty[vybrane_karty_index]=zakliknuta_karta_id;
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
            
            karta.classList.add("zakliknuta_karta");
            karta.classList.remove("vysouvani_karet");


            //Získání objketu karty a zjištění, jestli je karta spell
        let zakliknuta_karta_objekt =null;
        for(let i =0;i<hrac_inventar_objekty_karty.length;i++){
            if(zakliknuta_karta_id===hrac_inventar_objekty_karty[i].id)
                zakliknuta_karta_objekt = hrac_inventar_objekty_karty[i];
        }
        if(zakliknuta_karta_objekt.trida=="Spell"){
            //Odznačení míst na středu
            prazdna_mista = document.querySelectorAll(".prazdne_misto");
            prazdna_mista.forEach(misto => {
                misto.classList.remove("clickable");
                misto.onclick = null;
            });

            spell(zakliknuta_karta_objekt);
            return;
        }

        vybrane_karty[vybrane_karty_index]=zakliknuta_karta_id;
        // Zvýraznění prázdných míst
        prazdna_mista = document.querySelectorAll(".prazdne_misto");
        prazdna_mista.forEach(misto => {
            misto.classList.add("clickable");
            // Používám novější zápis funkce onlick, je to bezpečnější než string
            misto.onclick = function() { presunuti_karty(this.id); };
        });
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

        let objekt_karty;
        if (index_nalezene_karty > -1) {
            // Přesun objektu z inventáře na stůl
            objekt_karty = hrac_inventar_objekty_karty[index_nalezene_karty];
            hrac_prostredek_objekty_karty.push(objekt_karty);
            hrac_inventar_objekty_karty.splice(index_nalezene_karty, 1);
        }

        // --- LOGIKA ZOBRAZENÍ (DOM) ---
        // OPRAVA: Nemusíme mazat a znovu vytvářet. Stačí element přesunout (append ho sebere z původního místa).
        // Také je lepší neměnit ID karty, aby zůstala unikátní.
        
        // --- LOGIKA ZOBRAZENÍ (DOM) ---
        presunuta_karta_element.classList.remove("zakliknuta_karta");
        presunuta_karta_element.classList.remove("vysouvani_karet");
        
        presunuta_karta_element.classList.add("clickable"); // <--- PŘIDÁNO SEM
        
        if(objekt_karty.dmg>0)
            presunuta_karta_element.onclick = function() { utok(this); }; 
        else{
            presunuta_karta_element.onclick = function() { healovani(this); }; 
        }
        
        // Zrušíme prázdné místo (nebo do něj vložíme kartu)
        // Tvůj systém používá "zrušení prázdného místa" a vložení karty.
        // Aby se nerozbilo ID slotu, uděláme to takto:
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
    if(hrac_nebo_protihrac==="hrac")
    img.classList.add("karty");
else
    img.classList.add("protihrac_karty");

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
        setTimeout(() => protihrac_presunuti_karty(vybrana_objekt), 1000);
    }
}
//Protihráč, přesunutí karty na střed, nebo využití spellu z inventáře
function protihrac_presunuti_karty(objekt_karty) {
    if (protihrac_prostredek_prazdne_misto.length > 0||objekt_karty.trida==="Spell") {
        // Najdi objekt v inventáři
        let index = protihrac_inventar_objekty_karty.findIndex(k => k.id === objekt_karty.id);
        if (index === -1) return; // Chyba, karta nenalezena

        let objekt = protihrac_inventar_objekty_karty[index];
        let karta_element = document.getElementById(objekt_karty.id);
        karta_element.classList.remove("vysouvani_karet_protihrace");

        // Přesun v datech
        if(objekt_karty.trida!="Spell"){
        protihrac_inventar_objekty_karty.splice(index, 1);
        protihrac_prostredek_objekty_karty.push(objekt);
        

        // Přesun v grafice
        let slot_id = protihrac_prostredek_prazdne_misto.shift(); // Vezme první volný slot
        let slot_element = document.getElementById(slot_id);

        
        slot_element.appendChild(karta_element);
        }
        else{
            let random = Math.floor(Math.random()*hrac_prostredek_objekty_karty.length);
            let obrance_objekt = hrac_prostredek_objekty_karty[random];
            proved_utok_ai(objekt,obrance_objekt);
            karta_element.remove();
            let index = protihrac_inventar_objekty_karty.findIndex(k => k.id === objekt.id);
            if (index > -1) protihrac_inventar_objekty_karty.splice(index, 1);
        }
    }
}

// --- BOJ ---

function utok(karta_element_nebo_id) {
    // Získáme ID (pokud je předán element, vezmeme jeho ID)
    let utocnik_id = (karta_element_nebo_id instanceof Element) ? karta_element_nebo_id.id : karta_element_nebo_id;

    // Najdeme útočící kartu v poli hráče
    console.log(utocnik_id);
    utocici_karty_objekty[utocici_karty_objekty_index] = hrac_prostredek_objekty_karty.find(k => k.id === utocnik_id);
    
    if(!utocici_karty_objekty[utocici_karty_objekty_index]){
        utocici_karty_objekty[utocici_karty_objekty_index] = hrac_inventar_objekty_karty.find(k => k.id === utocnik_id);
    }
    if (!utocici_karty_objekty[utocici_karty_objekty_index]) {
        console.log("Chyba: Útočící karta nenalezena u hráče");
        return;
    }

    // Nastavíme karty protihráče jako cíle
    protihrac_prostredek_objekty_karty.forEach(objekt => {
        let el = document.getElementById(objekt.id);
        if (el) {
            el.classList.add("clickable");
            el.onclick = function() { snizeni_hp(objekt.id); }; // Předáváme ID cíle
        }
    });
}

function snizeni_hp(cil_id) {
    // Normalizace: Ať už je cil_id text, nebo element, získáme vždy jen textové ID
    let spravne_id = (cil_id instanceof Element) ? cil_id.id : cil_id;

    if (hraje_hrac) {
        if(spusteni_tahu){
            // --- HRÁČ ÚTOČÍ NEBO HEALUJE (VYKONÁNÍ TAHU) ---
            let cilovy_objekt;
            if(utocici_karty_objekty[utocici_karty_objekty_index].dmg > 0){
                // Hledáme cíl u protihráče (útok)
                let index_cile = protihrac_prostredek_objekty_karty.findIndex(k => k.id === spravne_id); 
                if (index_cile === -1) return;
                cilovy_objekt = protihrac_prostredek_objekty_karty[index_cile];
            } else {
                // Hledáme cíl u hráče (heal)
                let index_cile = hrac_prostredek_objekty_karty.findIndex(k => k.id === spravne_id);
                if (index_cile === -1) return;
                cilovy_objekt = hrac_prostredek_objekty_karty[index_cile];
            }

            // Výpočet poškození / healu
            cilovy_objekt.hp -= utocici_karty_objekty[utocici_karty_objekty_index].dmg;

            // Kontrola smrti karty
            if (cilovy_objekt.hp <= 0) {
                let el = document.getElementById(spravne_id);
                let rodic = el.parentElement;
                el.remove();
                protihrac_prostredek_prazdne_misto.push(rodic.id); 
                
                // Odstranění z pole (najdeme si index znovu, protože to mohla být tvoje nebo soupeřova karta)
                let smazat_index = protihrac_prostredek_objekty_karty.findIndex(k => k.id === spravne_id);
                if(smazat_index > -1) protihrac_prostredek_objekty_karty.splice(smazat_index, 1);
            }
            //maže rámečky u karet, které nezemřely.
            else{
                let cil_element = document.getElementById(spravne_id);
                let utocici_karta_hrace = document.getElementById(utocici_karty_objekty[utocici_karty_objekty_index].id);
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
            
            //Smazání spellu z inventáře po použití
            if(utocici_karty_objekty[utocici_karty_objekty_index].trida === "Spell"){
                let smazat_spell_id = utocici_karty_objekty[utocici_karty_objekty_index].id;
                document.getElementById(smazat_spell_id).remove();
        
                let index = hrac_inventar_objekty_karty.findIndex(k => k.id === smazat_spell_id);
                if (index > -1) hrac_inventar_objekty_karty.splice(index, 1);
            }

            // Vyčistit click listenery u protihráče (ty po útoku nepotřebují klikání)
            protihrac_prostredek_objekty_karty.forEach(obj => {
                let el = document.getElementById(obj.id);
                if(el) { el.classList.remove("clickable"); el.onclick = null; }
            });
            
            // OPRAVA: Tvým kartám nesmíme dát null, musíme jim vrátit původní funkci!
            hrac_prostredek_objekty_karty.forEach(obj => {
                let el = document.getElementById(obj.id);
                if(el) { 
                    el.classList.remove("clickable"); 
                    // Pokud je to útočník, vrátíme mu utok(), pokud healer, vrátíme healovani()
                    if (obj.dmg > 0) {
                        el.onclick = function() { utok(this); };
                    } else {
                        el.onclick = function() { healovani(this); };
                    }
                }
            });

            utocici_karty_objekty_index++;
            vybrane_karty_index++;
        }
        else {
            // --- PLÁNOVÁNÍ TAHU ---
            if(pocet_tahu > 0){
                let utocici_karta_hrace = document.getElementById(utocici_karty_objekty[utocici_karty_objekty_index].id);
                if(utocici_karta_hrace.classList.contains("prvni_ramecek")||utocici_karta_hrace.classList.contains("druhy_ramecek")||utocici_karta_hrace.classList.contains("treti_ramecek"))
                {
                    console.log("Hráč nemůže útočit/healovat stejnou kartou více karet.");
                    return;
                }
                pocet_tahu--;
                let cil_element = document.getElementById(spravne_id);

                // ZMĚNA ZDE: Ukládáme rovnou to ID (text), je to bezpečnější než element
                if(prvni_tah==null){ prvni_tah=snizeni_hp.bind(null, spravne_id); }
                else if(druhy_tah==null){ druhy_tah=snizeni_hp.bind(null, spravne_id); }
                else if(treti_tah==null){ treti_tah=snizeni_hp.bind(null, spravne_id); }

                //Orámečkování vybrané karty a prázdného místa
                switch(vybrane_karty_index){
                    case 0:
                        cil_element.classList.add("prvni_ramecek");
                        utocici_karta_hrace.classList.add("prvni_ramecek");
                        if(utocici_karty_objekty[utocici_karty_objekty_index].trida==="Spell"){
                            utocici_karta_hrace.classList.remove("zakliknuta_karta");
                            je_zakliknuta_karta = false; zakliknuta_karta_id = null; 
                            pomocne_pocitadlo_karet_v_inv--;
                            let btn = document.getElementById("pridavani_karet");
                            btn.classList.add("clickable");
                            btn.onclick = function() { pridani_karty("hrac"); };
                        }
                        break;
                    case 1:
                        cil_element.classList.add("druhy_ramecek");
                        utocici_karta_hrace.classList.add("druhy_ramecek");
                        if(utocici_karty_objekty[utocici_karty_objekty_index].trida==="Spell"){
                            utocici_karta_hrace.classList.remove("zakliknuta_karta");
                            je_zakliknuta_karta = false; zakliknuta_karta_id = null; 
                            pomocne_pocitadlo_karet_v_inv--;
                            let btn = document.getElementById("pridavani_karet");
                            btn.classList.add("clickable");
                            btn.onclick = function() { pridani_karty("hrac"); };
                        }
                        break;
                    case 2:
                        cil_element.classList.add("treti_ramecek");
                        utocici_karta_hrace.classList.add("treti_ramecek");
                        if(utocici_karty_objekty[utocici_karty_objekty_index].trida==="Spell"){
                            utocici_karta_hrace.classList.remove("zakliknuta_karta");
                            je_zakliknuta_karta = false; zakliknuta_karta_id = null; 
                            pomocne_pocitadlo_karet_v_inv--;
                            let btn = document.getElementById("pridavani_karet");
                            btn.classList.add("clickable");
                            btn.onclick = function() { pridani_karty("hrac"); };
                        }
                        break;
                }

                // --- PŘIDÁNO SEM: Čištění cílů po naplánování tahu ---
                protihrac_prostredek_objekty_karty.forEach(obj => {
                    let el = document.getElementById(obj.id);
                    if(el) { el.classList.remove("clickable"); el.onclick = null; }
                });
                hrac_prostredek_objekty_karty.forEach(obj => {
                    let el = document.getElementById(obj.id);
                    if(el) { 
                        el.classList.add("clickable"); 
                        if (obj.dmg > 0) el.onclick = function() { utok(this); };
                        else el.onclick = function() { healovani(this); };
                    }
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

// Speciální verze funkce pro AI útok, aby to bylo přehlednější
function proved_utok_ai(utocnik_objekt, obrance_objekt) {
    console.log(`AI útočí s ${utocnik_objekt.id} na tvoji ${obrance_objekt.id}`);
    
    obrance_objekt.hp -= utocnik_objekt.dmg;
    
    if (obrance_objekt.hp <= 0) {
        console.log("Tvoje karta zemřela!");
        let el = document.getElementById(obrance_objekt.id);
        let rodic = el.parentElement;
        el.remove();
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
        await pauza(1500); // Pauza mezi tahy
        
        // 1. Zjistíme, jaké akce jsou vůbec momentálně možné
        let muze_vylozit = protihrac_prostredek_objekty_karty.length < 4 && protihrac_inventar_objekty_karty.length > 0;
        let muze_vylozit_spell=false;
        if(hrac_prostredek_objekty_karty.length>0){
            for(let i =0;i<protihrac_inventar_objekty_karty.length;i++){
                if(protihrac_inventar_objekty_karty[i].trida==="Spell")
                {
                    muze_vylozit=true;
                    muze_vylozit_spell=false;
                    break;
                }
            }
        }
        let muze_liznout = protihrac_inventar_objekty_karty.length < 5;
        let muze_utocit = protihrac_prostredek_objekty_karty.length > 0 && hrac_prostredek_objekty_karty.length > 0;

        // 2. Nasypeme povolené akce do nového pole (0 = Vyložit, 1 = Líznout, 2 = Útok)
        let mozne_akce = [];
        if (muze_vylozit) mozne_akce.push(0);
        if (muze_liznout) mozne_akce.push(1);
        if (muze_utocit) mozne_akce.push(2);

        // 3. Záchranná brzda: Pokud AI nemůže dělat vůbec nic, ukončíme jeho tahy
        if (mozne_akce.length === 0) {
            console.log("AI už nemůže udělat žádnou platnou akci.");
            break; // Příkaz break nás okamžitě vyhodí z while cyklu ven
        }

        // 4. Náhodný výběr POUZE z povolených akcí (žádné vracení tahů už není potřeba)
        let akce = mozne_akce[Math.floor(Math.random() * mozne_akce.length)];

        console.log(`AI Akce: ${akce} (Zbývá tahů: ${protihrac_tahy})`);

        // 5. Samotné provedení
        switch (akce) {
            case 0:
                protihrac_vybrani_random_karty();
                break;
            case 1:
                pridani_karty("protihrac");
                break;
            case 2:
                let rand_moje = Math.floor(Math.random() * protihrac_prostredek_objekty_karty.length);
                let rand_tvoje = Math.floor(Math.random() * hrac_prostredek_objekty_karty.length);
                
                let utocnik = protihrac_prostredek_objekty_karty[rand_moje];
                let obrance = hrac_prostredek_objekty_karty[rand_tvoje];

                proved_utok_ai(utocnik, obrance);
                break;
        }
        
        // Na konci vždy odečteme tah, protože se zaručeně provedla platná akce
        protihrac_tahy--;
    }

    console.log("Protihráč dohrál.");
    pocet_kol++;
    hraje_hrac = true;
    console.log("Jsi na řadě! Tahy: " + pocet_tahu);

    // --- PŘIDÁNO: Oživení tlačítka na začátku tvého tahu ---
    let btn = document.getElementById("pridavani_karet");
    if (hrac_inventar_objekty_karty.length < 5) {
        btn.classList.add("clickable");
        btn.onclick = function() { pridani_karty("hrac"); };
    }

    //Aby měli karty na středu clickable detajllll
    hrac_prostredek_objekty_karty.forEach(obj => {
        let el = document.getElementById(obj.id);
        if(el) { 
            el.classList.add("clickable"); 
            }
        });
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

//Vypisování informací o kartě, na kterou zrovna najel
document.addEventListener('mouseover', (event) => {

  // Získáme konkrétní element, na kterém je teď myš
  const najetyElement = event.target;
  let informace = document.getElementById("informace");
  informace.innerHTML="Informace";//Resetování informací
  let objekt_karta;

  //Psaní informací při najetí na hráčovy karty
  if(najetyElement.classList.contains("karty")){
    for(let i =0;i<hrac_inventar_objekty_karty.length;i++){
        if(najetyElement.id===hrac_inventar_objekty_karty[i].id)
            objekt_karta = hrac_inventar_objekty_karty[i];
    }
    for(let i =0;i<hrac_prostredek_objekty_karty.length;i++){
        if(najetyElement.id===hrac_prostredek_objekty_karty[i].id)
            objekt_karta = hrac_prostredek_objekty_karty[i];
    }
    informace.innerHTML+="<br><br>Hráčova karta:<br><br>HP:"+objekt_karta.hp+"<br>DMG:"+objekt_karta.dmg;
  }

  //Psaní informací při najetí na protihráčovy karty
  else if(najetyElement.classList.contains("protihrac_karty")){
    for(let i =0;i<protihrac_inventar_objekty_karty.length;i++){
        if(najetyElement.id===protihrac_inventar_objekty_karty[i].id)
            objekt_karta = protihrac_inventar_objekty_karty[i];
    }
    for(let i =0;i<protihrac_prostredek_objekty_karty.length;i++){
        if(najetyElement.id===protihrac_prostredek_objekty_karty[i].id)
            objekt_karta = protihrac_prostredek_objekty_karty[i];
    }
    informace.innerHTML+="<br><br>Protihráčova karta:<br><br>HP:"+objekt_karta.hp+"<br>DMG:"+objekt_karta.dmg;
  }

});


function spell(objekt_spellu){
    //Karta útočí
    if(objekt_spellu.dmg>0){
        if(protihrac_prostredek_objekty_karty.length>0)
        {
            utok(objekt_spellu.id);
        }
        else{
            console.log("Spell nejde využít, protihráč nemá na středu karty.");
            return;
        }
    }
    //Karta healuje
    else{
        if(hrac_prostredek_objekty_karty.length>0)
        {
            healovani(objekt_spellu.id);
        }
        else{
            console.log("Spell nejde využít, hráč nemá na středu karty.");
            return;
        }
    }
}

function healovani(karta_element_nebo_id) {
    let karta_healovani_id = (karta_element_nebo_id instanceof Element) ? karta_element_nebo_id.id : karta_element_nebo_id;
    console.log("Healuje karta: " + karta_healovani_id);

    // Zkusíme najít healující kartu na stole
    utocici_karty_objekty[utocici_karty_objekty_index] = hrac_prostredek_objekty_karty.find(k => k.id === karta_healovani_id);
    
    // Pokud není na stole, zkusíme inventář (pro Spelly)
    if(!utocici_karty_objekty[utocici_karty_objekty_index]){
        utocici_karty_objekty[utocici_karty_objekty_index] = hrac_inventar_objekty_karty.find(k => k.id === karta_healovani_id);
    }
    
    if (!utocici_karty_objekty[utocici_karty_objekty_index]) {
        console.log("Chyba: Healující karta nenalezena");
        return;
    }

    // Nastavíme TVOJE VLASTNÍ karty na stole jako cíle (pro heal)
    hrac_prostredek_objekty_karty.forEach(objekt => {
        let el = document.getElementById(objekt.id);
        if (el) {
            el.classList.add("clickable");
            el.onclick = function() { snizeni_hp(objekt.id); }; // Cíl je tvoje karta
        }
    });
} 