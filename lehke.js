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
var pole_charakteru_karet = [Lucistnik,Spartan,Mag_ohne,Fireball,Kopinik,Jedovy_sip,Kusnik,Paladin,Leceni,Lecitel];

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


var pomocne_pole_pri_healovani = [];

//Pomocné proměnnp pro protihráče
// Paměť pro tahy protihráče
var protihrac_fronta_tahu = [null,null,null];
var protihrac_orameckovane_karty_id = [];
var protihrac_inventar_pomocna_length = 0;
var protihrac_prostredek_pomocna_length = 0;
var protihrac_prvni_element_tahu_id = [];
var protihrac_druhy_element_tahu_id = [];
var index_protihrac_element_tahu = 0;
// --- HLAVNÍ FUNKCE ---

//Vygeneruje random karty na začátku tahu pro hráče a protihráče
window.onload = function() {
    // Rozdání počátečních karet
    spusteni_tahu=true;
    let hrac_dostal_jen_spell=true;
    let protihrac_dostal_jen_spell=true;
    for (let i = 0; i < 5; i++) {
        pridani_karty("hrac");
        pocet_tahu = 3; // Resetujeme tahy, protože přidání karty při startu je nebere
        pridani_karty("protihrac");

        //Kontrola toho, jestli hráč nebo protihráč dostali jenom spelly
        if(hrac_inventar_objekty_karty[i].trida!="Spell")
        hrac_dostal_jen_spell=false;
        if(protihrac_inventar_objekty_karty[i].trida!="Spell")
            protihrac_dostal_jen_spell=false;
    }
    //Pokud má hráč v inventáři jen Spelly
    if(hrac_dostal_jen_spell===true)
    {
        while(hrac_inventar_objekty_karty[4].trida==="Spell"){
            document.getElementById(hrac_inventar_objekty_karty[4].id).remove();
            hrac_inventar_objekty_karty.splice(4,1);
            pridani_karty("hrac");
        }
    }
    //Pokud má protihráč v inventáři jen Spelly
    if(protihrac_dostal_jen_spell===true)
    {
        while(protihrac_inventar_objekty_karty[4].trida==="Spell"){
            document.getElementById(protihrac_inventar_objekty_karty[4].id).remove();
            protihrac_inventar_objekty_karty.splice(4,1);
            pridani_karty("protihrac");
        }
    }
    
    spusteni_tahu=false;
    vybrane_karty_index = 0;
    document.getElementById("kola").innerHTML="Kola<br><br>Počet kol: "+pocet_kol;
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
        smazani_ostatnich_fci();
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

//Přesune karty z inventáře na střed
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
        document.getElementById("konecTahu").classList.add("clickable");
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
        
        //Začátek
        pocet_tahu--;
        document.getElementById("konecTahu").classList.add("clickable");
        if(prvni_tah==null){
            prvni_tah=pridani_karty.bind(null,hrac_nebo_protihrac);
        }
        else if(druhy_tah==null){
            druhy_tah=pridani_karty.bind(null,hrac_nebo_protihrac);
        }
        else if(treti_tah==null){
            treti_tah=pridani_karty.bind(null,hrac_nebo_protihrac);
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
    let random_index = Math.floor(Math.random() * pole_charakteru_karet.length);
    // Vytvoření kopie objektu
    let nova_karta_objekt = { ...pole_charakteru_karet[random_index] };


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

//Protihráč, přesunutí karty na střed, nebo využití spellu z inventáře
// Nová funkce pro fyzický přesun
function protihrac_presunuti_karty_vykonani(objekt_karty, slot_id) {
    let index = protihrac_inventar_objekty_karty.findIndex(k => k.id === objekt_karty.id);
    if (index > -1) {
        // Přesun v datech
        protihrac_inventar_objekty_karty.splice(index, 1);
        protihrac_prostredek_objekty_karty.push(objekt_karty);
        
        let slot_index = protihrac_prostredek_prazdne_misto.indexOf(slot_id);
        if(slot_index > -1) protihrac_prostredek_prazdne_misto.splice(slot_index, 1);

        // Přesun v grafice
        let karta_el = document.getElementById(objekt_karty.id);
        karta_el.classList.remove("vysouvani_karet_protihrace"); // pokud tam ještě zbyla
        let slot_el = document.getElementById(slot_id);
        slot_el.appendChild(karta_el);
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
    obrance_objekt.hp -= utocnik_objekt.dmg;
    
    if (obrance_objekt.hp <= 0) {
        let el = document.getElementById(obrance_objekt.id);
        if (!el) return;
        
        let rodic = el.parentElement;
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
}

async function protihrac_random_tahy() {
    hraje_hrac = false;
    let tahy_k_dispozici = 3;
    let naplanovane_tahy = []; // Fronta funkcí k vykonání nakonec

    // --- VIRTUÁLNÍ STAV PRO PLÁNOVÁNÍ ---
    // Aby AI vědělo, s čím už v rámci těchto 3 tahů manipulovalo
    let v_ruce_karty = [...protihrac_inventar_objekty_karty];
    let v_ruce_pocet = protihrac_inventar_objekty_karty.length;
    let volne_sloty = [...protihrac_prostredek_prazdne_misto];
    let na_stole_karty = [...protihrac_prostredek_objekty_karty];
    let utocnici = [...protihrac_prostredek_objekty_karty]; // Karty, které ještě tento tah neútočily

    console.log("--- Začíná plánování tahů protihráče ---");

    // --- PŘIDÁNO: Počáteční pauza, aby AI nezačalo hrát okamžitě ---
    await pauza(1500);

    for (let i = 0; i < tahy_k_dispozici; i++) {
        // Třídy pro rámečky (1., 2. a 3. tah)
        let trida_ramecku = `protihrac_${["prvni", "druhy", "treti"][i]}_ramecek`;
        
        // 1. Co je momentálně (virtuálně) možné?
        let muze_liznout = v_ruce_pocet < 5;
        
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

        let muze_utocit = pouzitelni_utocnici.length > 0;

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
        console.log(`AI plánuje akci: ${akce} (Zbývají tahy: ${tahy_k_dispozici - i})`);

        // 5. Zpracování akce a přidání do fronty
        if (akce === 0) { 
            // --- VYLOŽENÍ KARTY ---
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
                document.getElementById(slot_id).classList.add(trida_ramecku);
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
            let utocnik = pouzitelni_utocnici[Math.floor(Math.random() * pouzitelni_utocnici.length)];
            
            // Odstraníme ho z hlavní fronty utocnici, aby nehrál tento tah znovu
            let utocnik_index = utocnici.findIndex(k => k.id === utocnik.id);
            if (utocnik_index > -1) utocnici.splice(utocnik_index, 1); 

            // Pokud AI healuje útokem, hledá u sebe. Jinak u tebe.
            let cile = utocnik.dmg > 0 ? hrac_prostredek_objekty_karty : na_stole_karty;
            let obrance = cile[Math.floor(Math.random() * cile.length)];

            document.getElementById(utocnik.id).classList.add(trida_ramecku);
            document.getElementById(obrance.id).classList.add(trida_ramecku);

            naplanovane_tahy.push(() => proved_utok_ai(utocnik, obrance));
        }

        // Časová prodleva 1.5 sekundy po označení tahu
        await pauza(1500); 
    }

    console.log("--- Vykonávám naplánované tahy ---");
    
    // Nyní proběhne vykonání všech nasbíraných tahů v jeden moment!
    naplanovane_tahy.forEach(tah_funkce => tah_funkce());

    // Úklid rámečků
    odstran_vsechny_protihrac_ramecky();

    console.log("Protihráč dohrál.");
    pocet_kol++;
    hraje_hrac = true;
    pocet_tahu = 3;
    document.getElementById("kola").innerHTML="Kola<br><br>Počet kol: "+pocet_kol;

    // Oživení tlačítka
    let btn = document.getElementById("pridavani_karet");
    if (hrac_inventar_objekty_karty.length < 5) {
        btn.classList.add("clickable");
        btn.onclick = function() { pridani_karty("hrac"); };
    }

    hrac_prostredek_objekty_karty.forEach(obj => {
        let el = document.getElementById(obj.id);
        if(el) el.classList.add("clickable"); 
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
                if (index_cile === -1){
                    if(utocici_karty_objekty[utocici_karty_objekty_index].trida==="Spell"){
                        //Smaže útočící spell, aby se předešlo bugu, že spell zůstane v inventáři, protože karta, na kterou chtěl dané kolo útočit, už zemřela.
                        let smazat_spell_id = utocici_karty_objekty[utocici_karty_objekty_index].id;
                        document.getElementById(smazat_spell_id).remove();
                        let index = hrac_inventar_objekty_karty.findIndex(k => k.id === smazat_spell_id);
                        if (index > -1) hrac_inventar_objekty_karty.splice(index, 1);
                        utocici_karty_objekty_index++;
                    }
                    return;
                } 
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
            //Vykoná se pokud karta nezemře, podemnout
            //maže rámečky u karet, které nezemřely.
            else{
                let cil_element = document.getElementById(spravne_id);
                let utocici_karta_hrace = document.getElementById(utocici_karty_objekty[utocici_karty_objekty_index].id);
                abilitky_karet(utocici_karty_objekty[utocici_karty_objekty_index],cilovy_objekt);
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
                smazani_ostatnich_fci();
                let utocici_karta_hrace = document.getElementById(utocici_karty_objekty[utocici_karty_objekty_index].id);
                if(utocici_karta_hrace.onclick === null)
                {
                    console.log("Karta už je používána.");
                    return;
                }

                //Začátek
                pocet_tahu--;
                document.getElementById("konecTahu").classList.add("clickable");
                let cil_element = document.getElementById(spravne_id);

                // ZMĚNA ZDE: Ukládáme rovnou to ID (text), je to bezpečnější než element
                if(prvni_tah==null){ prvni_tah=snizeni_hp.bind(null, spravne_id); }
                else if(druhy_tah==null){ druhy_tah=snizeni_hp.bind(null, spravne_id); }
                else if(treti_tah==null){ treti_tah=snizeni_hp.bind(null, spravne_id); }

                utocici_karta_hrace.onclick=null;
                utocici_karta_hrace.classList.remove("clickable");
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
                /*
                hrac_prostredek_objekty_karty.forEach(obj => {
                    let el = document.getElementById(obj.id);
                    console.log(el);
                    if(el) { 
                        el.classList.add("clickable"); 
                        if (obj.dmg > 0) el.onclick = function() { utok(this); };
                        else el.onclick = function() { healovani(this); };
                    }
                });
                */
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
function potvrzeni_tahu(){
    if(pocet_tahu<3){

    vybrane_karty_index=0;  //Proto aby fungovalo dobře přesouvání karet;

    let potvrzovaci_tlacitko = document.getElementById("konecTahu").classList.remove("clickable");    //Změna kurzoru při najetí na potvrzení tahu
    spusteni_tahu = true;
    utocici_karty_objekty_index=0;  //Aby fungovalo útočení
    prvni_tah();
    prvni_tah=null;
    if(druhy_tah !=null){
        druhy_tah();
        druhy_tah=null;
        if(treti_tah!=null)
        {
            treti_tah();
            treti_tah=null;
        }
    }

    //Mazání rámečků kolem karet
    let hracovo_pole_karet_prostredek = document.getElementById("pole_vykladani_hrace");
            Array.from(hracovo_pole_karet_prostredek.children).forEach(prazdne_misto =>{
                if(prazdne_misto.children.length>0){
                prazdne_misto.children[0].classList.remove("prvni_ramecek");
                prazdne_misto.children[0].classList.remove("druhy_ramecek");
                prazdne_misto.children[0].classList.remove("treti_ramecek");
                }
            });

    //Hraje protihráč
    protihrac_random_tahy();

    //Hráč je znovu na tahu
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
    pomocne_pole_pri_healovani = [];

    }
    //Když hráč neudělá ani jeden tah, tak to nejde spustit
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
    if(objekt_karta.dmg>0)
        informace.innerHTML+="<br><br>Hráčova karta:<br><br>HP:"+objekt_karta.hp+"<br>DMG:"+objekt_karta.dmg;
    else
        informace.innerHTML+="<br><br>Hráčova karta:<br><br>HP:"+objekt_karta.hp+"<br>Heal:"+(-1*objekt_karta.dmg);
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
    if(objekt_karta.dmg>0)
        informace.innerHTML+="<br><br>Protihráčova karta:<br><br>HP:"+objekt_karta.hp+"<br>DMG:"+objekt_karta.dmg;
    else
        informace.innerHTML+="<br><br>Protihráčova karta:<br><br>HP:"+objekt_karta.hp+"<br>Heal:"+(-1*objekt_karta.dmg);
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
    smazani_ostatnich_fci();
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
            if(el.onclick===null)
            {
                pomocne_pole_pri_healovani.push(objekt);
            }
            el.onclick = function() { snizeni_hp(objekt.id); }; // Cíl je tvoje karta
        }
    });
} 

function smazani_ostatnich_fci(){
    //mazání f-ce snizeni_hp() a healovani() karet, která jsou na prostředku
    if(protihrac_prostredek_objekty_karty.length>0){
        let pole_vykladani_protihrace = document.getElementById("pole_vykladani_protihrace");
        for(let i = 0; i < pole_vykladani_protihrace.childElementCount;i++){
            let element_prazdneho_mista = pole_vykladani_protihrace.children[i];
            if(element_prazdneho_mista.childElementCount>0){
            let protihrac_karta_prostredek = element_prazdneho_mista.children[0];
            if(protihrac_karta_prostredek.classList.contains("protihrac_karty")){
                protihrac_karta_prostredek.onclick=null;
                protihrac_karta_prostredek.classList.remove("clickable");
            }
        }
        }
}
//přiřazení f-ce snizenihp() a healovani hp() hracovym kartam na prostredku
if(hrac_prostredek_objekty_karty.length>0){
    let pole_vykladani_hrace = document.getElementById("pole_vykladani_hrace");
    for(let i = 0; i < pole_vykladani_hrace.childElementCount;i++){
        let element_prazdneho_mista = pole_vykladani_hrace.children[i];

        if(element_prazdneho_mista.childElementCount>0){
            let hrac_karta_prostredek = element_prazdneho_mista.children[0];
        if(hrac_karta_prostredek.classList.contains("karty")){
            for(let i =0;i<pomocne_pole_pri_healovani.length;i++){
            if(hrac_karta_prostredek.id===pomocne_pole_pri_healovani[i].id){
                hrac_karta_prostredek.onclick=null;
                hrac_karta_prostredek.classList.remove("clickable");
            }
        }
            if(pomocne_pole_pri_healovani.length!=hrac_prostredek_objekty_karty.length){
                for(let o = 0;o<hrac_prostredek_objekty_karty.length;o++){
                    if(hrac_prostredek_objekty_karty[o].id===hrac_karta_prostredek.id&&hrac_karta_prostredek.onclick!=null){
                        if(hrac_prostredek_objekty_karty[o].dmg>0)
                        {
                            hrac_karta_prostredek.onclick = function() { utok(this); };
                        }
                        else{
                            hrac_karta_prostredek.onclick = function() { healovani(this); };
                        }
                        hrac_karta_prostredek.classList.add("clickable");
                    }
                }
            }
        }
    }
    }
}
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

//Fungování abilitek karet podemonu
function abilitky_karet(utocici_karta_objekt, cilova_karta_objekt){
    if(utocici_karta_objekt.ability!=""){
        for(let i =0;i<cilova_karta_objekt.debuff.length;i++){
            if(cilova_karta_objekt.debuff[i]===utocici_karta_objekt.ability)
                return;
        }
        cilova_karta_objekt.debuff.push(utocici_karta_objekt.ability);
    }
}


function pouziti_abilitek(debuff_karta_objekt){
if(debuff_karta_objekt.debuff.length!=0){
    for(let i =0; i < debuff_karta_objekt.debuff.length;i++){
        switch(debuff_karta_objekt.debuff[i]){
            case "ohen":debuff_karta_objekt.hp-=5;console.log("ohen");break;
            case "jed":debuff_karta_objekt.hp-=10;console.log("jed");break;
            default:console.log("Chyba při ve funkci pouziti_abilitek. řádek 1184");break;
        }
    }
    if(debuff_karta_objekt.hp<=0){
        console.log("Dostalo se to sem");
        let el = document.getElementById(debuff_karta_objekt.id);
        let rodic = el.parentElement;
        el.remove();

        //Upravit, aby to fungovalo na hráče i protihráče.
        if(rodic.classList.contains("protivnik_prazdne_misto")){ 
        protihrac_prostredek_prazdne_misto.push(rodic.id); 

        // Odstranění z pole (najdeme si index znovu, protože to mohla být tvoje nebo soupeřova karta)
        let smazat_index = protihrac_prostredek_objekty_karty.findIndex(k => k.id === debuff_karta_objekt.id);
        if(smazat_index > -1) protihrac_prostredek_objekty_karty.splice(smazat_index, 1);
        }
        else{
            // Odstranění z pole (najdeme si index znovu, protože to mohla být tvoje nebo soupeřova karta)
            let smazat_index = protihrac_prostredek_objekty_karty.findIndex(k => k.id === debuff_karta_objekt.id);
            if(smazat_index > -1) protihrac_prostredek_objekty_karty.splice(smazat_index, 1);
        }

    }
}
}


function prohledani_karet_uprostred_ability(){
    if(hraje_hrac){
        for(let i =0;i<protihrac_prostredek_objekty_karty.length;i++){
            pouziti_abilitek(protihrac_prostredek_objekty_karty[i]);
        }
    }
    else{
        for(let i =0;i<hrac_prostredek_objekty_karty.length;i++){
            pouziti_abilitek(hrac_prostredek_objekty_karty[i]);
        }
    }
}

//Fungování abilitek karet nademnou
