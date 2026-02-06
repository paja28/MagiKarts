    var je_zakliknuta_karta =false;
    var zakliknuta_karta_id = null;
    var hrac_id_chybejicich_karet = ["karta1","karta2","karta3","karta4","karta5"];
    var protihrac_id_chybejicich_karet = ["protihrac_karta1","protihrac_karta2","protihrac_karta3","protihrac_karta4","protihrac_karta5"];
    var protihrac_prostredek_prazdne_misto = ["protihrac_pole_karta1","protihrac_pole_karta2","protihrac_pole_karta3","protihrac_pole_karta4"];
    var protihrac_prostredek_prazdne_misto_chybejici =[];
    var protihrac_inventar_objekty_karty =[];       
    var protihrac_prostredek_objekty_karty = [];
    var pole_karet = [Lucistnik,Bojovnik,Carodej,Spartan,Fireball];
    var hrac_inventar_objekty_karty = [];     //v tomhle jsou objekty, která má jakákoliv karta v hráčovím inventáři
    var hrac_prostredek_objekty_karty = [];
    var index_hrac_karty_objekty = 0;
    var utocici_karta_objekt = null;
    var byvala_zakliknuta_karta_id ="";//Slouží aby při rychlém kliknutí na kartu v inventáři, se neprobugovala nahoru
    var vysouvani_pomocna_promenna2 =0;//Slouží aby při rychlém kliknutí na kartu v inventáři, se neprobugovala nahoru

    window.onload = function() {    //dá hráči prvních 5 random karet
        for(let i =0;i<5;i++){
            pridani_karty("hrac");
            pridani_karty("protihrac");
        }
    }

    function nakliknuto(id){
        let karta = document.getElementById(id);
        let prazdna_mista;
        //karta.classList.toggle("zakliknuta_karta");       
        //karta.classList.toggle("karty");              Nefunguje, nevím proč


        if(!je_zakliknuta_karta)
        {
            je_zakliknuta_karta=true;
            zakliknuta_karta_id = id;
            karta.classList.add("zakliknuta_karta");
            karta.classList.remove("vysouvani_karet");

            prazdna_mista = document.querySelectorAll(".prazdne_misto");
            if(prazdna_mista.length>0){
            for(let i =0;i<prazdna_mista.length;i++){
                prazdna_mista[i].classList.add("clickable");
                prazdna_mista[i].setAttribute("onclick","presunuti_karty(\'"+prazdna_mista[i].id+"\')");
            }
        }
        }
        else{
            if(zakliknuta_karta_id==id)  {  //kontrola jestli hráč kliknul na již vysunutou kartu
                je_zakliknuta_karta=false;                       
                karta.classList.remove("zakliknuta_karta");
                byvala_zakliknuta_karta_id = zakliknuta_karta_id;
                zakliknuta_karta_id ="";
                prazdna_mista = document.querySelectorAll(".prazdne_misto");
                for(let i =0;i<prazdna_mista.length;i++){
                    prazdna_mista[i].classList.remove("clickable");
                prazdna_mista[i].removeAttribute("onclick");            
                }
                setTimeout(function(){
                    console.log(byvala_zakliknuta_karta_id,zakliknuta_karta_id);
                    if(byvala_zakliknuta_karta_id!=zakliknuta_karta_id)
                    karta.classList.add("vysouvani_karet");
                },200)
            
            }
            else
            {
                je_zakliknuta_karta=true;
                document.getElementById(zakliknuta_karta_id).classList.add("vysouvani_karet");
                document.getElementById(zakliknuta_karta_id).classList.remove("zakliknuta_karta");
                karta.classList.add("zakliknuta_karta");
                karta.classList.remove("vysouvani_karet");

                byvala_zakliknuta_karta_id = zakliknuta_karta_id;
                zakliknuta_karta_id = id;

                prazdna_mista = document.querySelectorAll(".prazdne_misto");
                for(let i =0;i<prazdna_mista.length;i++){
                prazdna_mista[i].classList.add("clickable");
                prazdna_mista[i].setAttribute("onclick","presunuti_karty(\'"+prazdna_mista[i].id+"\')");
                }
            }
        }
            
    }

    function presunuti_karty(id_prazdneho_mista){
        if(zakliknuta_karta_id !=null){
            const presunuta_karta = document.getElementById(zakliknuta_karta_id);
            const hracovo_pole_vykladani = document.getElementById("pole_vykladani_hrace");
            document.getElementById(id_prazdneho_mista).remove();       //vymaže prázdné místo na vykládání
            document.getElementById(zakliknuta_karta_id).remove();
            for(let i = 0;i<hrac_inventar_objekty_karty.length;i++){
                if(hrac_inventar_objekty_karty[i].id==zakliknuta_karta_id){
                    hrac_inventar_objekty_karty[i].id = id_prazdneho_mista;      //předělání id u objektu při přesunu
                    hrac_prostredek_objekty_karty.push(hrac_inventar_objekty_karty[i]);
                    hrac_inventar_objekty_karty.splice(i,1);
                    break;
                }
            }
            hrac_id_chybejicich_karet.push(zakliknuta_karta_id);//dává do pole id karty, která hráčovi chybí
            if(!document.getElementById("pridavani_karet").hasAttribute("onclick")) //přidání attributu, aby si hráč mohl nakliknout další kartu, když jich nemá 5
            {
                document.getElementById("pridavani_karet").classList.add("clickable");
                document.getElementById("pridavani_karet").setAttribute("onclick","pridani_karty(\"hrac\")");
            }

            //predelani karty aby mela stejne classy jako ostatni v poli
            presunuta_karta.removeAttribute("onclick");
            presunuta_karta.classList.remove("zakliknuta_karta");        
            presunuta_karta.id=id_prazdneho_mista;
            presunuta_karta.setAttribute("onclick","utok("+presunuta_karta.id+")");
            //
                
            document.getElementById("pridavani_karet").classList.add("clickable");

            hracovo_pole_vykladani.append(presunuta_karta);
            je_zakliknuta_karta=false;
            zakliknuta_karta_id=null;

            for(let i =0;i<prazdna_mista.length;i++){               //nastavení všech prázdných míst, aby nebyli klikatelný
                prazdna_mista[i].classList.remove("clickable");    
            }

            //tady začíná hrát protihráč
            protihrac_vybrani_random_karty();
        }
        else
            console.log("Chyba, zakliknuta_karta je rovna null. Ve funkci presunuti_karty()");
    }
    
    function pridani_karty(hrac_nebo_protihrac){
    if(hrac_id_chybejicich_karet.length >0|| hrac_nebo_protihrac=="protihrac"){
        let random = Math.floor(Math.random() * pole_karet.length);
        let id_chybejici_karty;
        let karty_hrace_nebo_protihrace;
        // !!! TADY JE TA ZMĚNA: Vytvoříme kopii objektu, ne jen odkaz
        let nova_karta_objekt = { ...pole_karet[random]};

        if(hrac_nebo_protihrac=="hrac")
        id_chybejici_karty = hrac_id_chybejicich_karet.shift(); 
        else
        id_chybejici_karty = protihrac_id_chybejicich_karet.shift();

        nova_karta_objekt.id = id_chybejici_karty; // Teď měníme ID jen té kopii

        // Uložíme kopii do pole objektů hráče
        if(hrac_nebo_protihrac=="hrac"){
        hrac_inventar_objekty_karty.push(nova_karta_objekt);
        karty_hrace_nebo_protihrace = document.getElementById("hracovy_karty");
        }
        else{
        protihrac_inventar_objekty_karty.push(nova_karta_objekt);
        karty_hrace_nebo_protihrace = document.getElementById("protihracovy_karty");
        }
        
        const nova_karta_img = document.createElement("img");
       
        nova_karta_img.setAttribute("id", id_chybejici_karty);
        if(hrac_nebo_protihrac=="hrac"){
        nova_karta_img.classList.add("karty", "vysouvani_karet","clickable");
        nova_karta_img.setAttribute("onclick", "nakliknuto('" + id_chybejici_karty + "')");
        }
    else
        nova_karta_img.classList.add("karty");

        nova_karta_img.setAttribute("src", nova_karta_objekt.img);
       
        karty_hrace_nebo_protihrace.appendChild(nova_karta_img);  
    } else {
        document.getElementById("pridavani_karet").classList.remove("clickable");
        document.getElementById("pridavani_karet").removeAttribute("onclick");
    }    
    }

    //předělat na objekty, snad funguje
    function protihrac_vybrani_random_karty(){;
        if(protihrac_prostredek_objekty_karty.length<4){      //Kontrola, jestli je na středě místo
        let random = Math.floor(Math.random() * protihrac_inventar_objekty_karty.length);
        console.log(protihrac_inventar_objekty_karty,protihrac_prostredek_objekty_karty);
        let random_objekt_karta = protihrac_inventar_objekty_karty[random];
        console.log(random_objekt_karta);
        let random_karta = document.getElementById(random_objekt_karta.id);
        random_karta.classList.add("vysouvani_karet_protihrace");
        const zpozdeni = setTimeout(protihrac_presunuti_karty, 1000);
        }
    }

    function protihrac_presunuti_karty(){
        const protihrac_prazdne_misto = protihrac_prostredek_prazdne_misto.splice(0,1);
        protihrac_prostredek_prazdne_misto_chybejici.push(protihrac_prazdne_misto);
        const karta_na_vymazani = document.querySelector(".vysouvani_karet_protihrace");
        for(let i =0;i<protihrac_inventar_objekty_karty.length;i++){
            if(karta_na_vymazani.id==protihrac_inventar_objekty_karty[i].id)
            {
                protihrac_prostredek_objekty_karty.push(protihrac_inventar_objekty_karty[i]);
                protihrac_inventar_objekty_karty.splice(i,1);
                break;
            }
        }
        const protihrac_presunuta_karta = karta_na_vymazani;
        const protihracovo_pole_vykladani_karet = document.getElementById("pole_vykladani_protihrace");
        karta_na_vymazani.remove();//vymazání karty u protihráče
        document.getElementById(protihrac_prazdne_misto).remove();//vymazání prázdného místa na středu
        protihrac_presunuta_karta.classList.remove("vysouvani_karet_protihrace");
        protihracovo_pole_vykladani_karet.append(protihrac_presunuta_karta);
        console.log(protihrac_prostredek_objekty_karty,protihrac_inventar_objekty_karty);
    }

    function utok(karta_utocna){
        for(let i = 0;i<hrac_prostredek_objekty_karty.length;i++){
                if(hrac_prostredek_objekty_karty[i].id==karta_utocna.id){
                    utocici_karta_objekt = hrac_prostredek_objekty_karty[i];      //předělání id u objektu při přesunu
                    break;
                }
            }
            console.log(utocici_karta_objekt);
        for(let i =0; i < protihrac_prostredek_objekty_karty.length;i++){
            console.log(document.getElementById(protihrac_prostredek_objekty_karty[i].id));
            document.getElementById(protihrac_prostredek_objekty_karty[i].id).setAttribute("onclick","snizeni_hp(\""+protihrac_prostredek_objekty_karty[i].id+"\")");
        }
    }

    function snizeni_hp(karta_snizeni_hp_id,utocna_karta_element){
        let index_utocne_karty =0;
        let index_poskozene_karty =0;
        for(let i =0;i<protihrac_prostredek_objekty_karty.length;i++){  //nalezení protihracoveho objektu
            if(protihrac_prostredek_objekty_karty[i].id==karta_snizeni_hp_id)
            {
                index_poskozene_karty = i;
            }
        }
        protihrac_prostredek_objekty_karty[index_poskozene_karty].hp -= utocici_karta_objekt.dmg;
        if(protihrac_prostredek_objekty_karty[index_poskozene_karty].hp<=0){
            const prazdne_misto_prostredek = document.createElement("div");
            prazdne_misto_prostredek.id = protihrac_prostredek_prazdne_misto_chybejici.shift();
            prazdne_misto_prostredek.classList.add("protivnik_prazdne_misto");
            document.getElementById("pole_vykladani_protihrace").appendChild(prazdne_misto_prostredek).innerHTML="Prazdné_místo";
            console.log(document.getElementById("pole_vykladani_protihrace"));
            document.getElementById(protihrac_prostredek_objekty_karty[index_poskozene_karty].id).remove();
            protihrac_prostredek_objekty_karty.splice(index_poskozene_karty,1);
        }
    }

