    var je_zakliknuta_karta =false;
    var zakliknuta_karta = null;
    var pole_chybejicich_karet = ["karta1","karta2","karta3","karta4","karta5"];
    var pole_karet_protihrace =["protihrac_karta1","protihrac_karta2","protihrac_karta3","protihrac_karta4","protihrac_karta5"];
    var protihrac_pole_chybejicich_karet = ["protihrac_pole_karta1","protihrac_pole_karta2","protihrac_pole_karta3","protihrac_pole_karta4"];
    var protihrac_utocne_karty = []; //
    var pole_karet = [Lucistnik,Bojovnik,Kouzelnik,Spartan,Fireball];
    var hrac_objekty_karty = [];     //v tomhle jsou objekty, která má jakákoliv karta v hráčovím inventáři
    var index_hrac_karty_objekty = 0;
    window.onload = function() {    //dá hráči prvních 5 random karet
        for(let i =0;i<5;i++){
            pridani_karty();
        }
        console.log(pole_chybejicich_karet);
    }

    function nakliknuto(id){
        let karta = document.getElementById(id);
        let prazdna_mista;
        //karta.classList.toggle("zakliknuta_karta");       
        //karta.classList.toggle("karty");              Nefunguje, nevím proč
        
        if(!je_zakliknuta_karta)
        {
            je_zakliknuta_karta=true;
            zakliknuta_karta = id;
            karta.classList.add("zakliknuta_karta");
            karta.classList.remove("vysouvani_karet");

            prazdna_mista = document.querySelectorAll(".prazdne_misto");
            if(prazdna_mista.length>0){
            for(let i =0;i<prazdna_mista.length;i++){
                prazdna_mista[i].setAttribute("onclick","presunuti_karty(\'"+prazdna_mista[i].id+"\')");
            }
        }
        }
        else{
            if(zakliknuta_karta==id)  {  //kontrola jestli hráč kliknul na již vysunutou kartu
                je_zakliknuta_karta=false;                       
                karta.classList.remove("zakliknuta_karta");
                karta.classList.add("vysouvani_karet");                //Přidat sem, aby se classa vysouvani_karet přidala o vteřinu cca později, bude to mít lepší efekt
                zakliknuta_karta ="";

                prazdna_mista = document.querySelectorAll(".prazdne_misto");
                for(let i =0;i<prazdna_mista.length;i++){
                prazdna_mista[i].removeAttribute("onclick");            
            }
            }
            else
            {
                je_zakliknuta_karta=true;
                document.getElementById(zakliknuta_karta).classList.add("vysouvani_karet");
                document.getElementById(zakliknuta_karta).classList.remove("zakliknuta_karta");
                karta.classList.add("zakliknuta_karta");
                karta.classList.remove("vysouvani_karet");
                zakliknuta_karta = id;


                prazdna_mista = document.querySelectorAll(".prazdne_misto");
                if(prazdna_mista.length>0){
                for(let i =0;i<prazdna_mista.length;i++){
                prazdna_mista[i].setAttribute("onclick","presunuti_karty(\'"+prazdna_mista[i].id+"\')");
                }
            }
            }
        }
            
    }

    function presunuti_karty(id_prazdneho_mista){
        if(zakliknuta_karta !=null){
            const presunuta_karta = document.getElementById(zakliknuta_karta);
            const hracovo_pole_vykladani = document.getElementById("pole_vykladani_hrace");
            document.getElementById(id_prazdneho_mista).remove();       //vymaže prázdné místo na vykládání
            document.getElementById(zakliknuta_karta).remove();
            for(let i = 0;i<hrac_objekty_karty.length;i++){
                if(hrac_objekty_karty[i].id==zakliknuta_karta){
                    hrac_objekty_karty[i].id = id_prazdneho_mista;      //předělání id u objektu při přesunu
                    break;
                }
            }
            console.log(hrac_objekty_karty);
            pole_chybejicich_karet.push(zakliknuta_karta);//dává do pole id karty, která hráčovi chybí
            if(!document.getElementById("pridavani_karet").hasAttribute("onclick")) //přidání attributu, aby si hráč mohl nakliknout další kartu, když jich nemá 5
            {
                document.getElementById("pridavani_karet").setAttribute("onclick","pridani_karty()");
            }

            //predelani karty aby mela stejne classy jako ostatni v poli
            presunuta_karta.removeAttribute("onclick");
            presunuta_karta.classList.remove("zakliknuta_karta");        
            presunuta_karta.id=id_prazdneho_mista;
            presunuta_karta.setAttribute("onclick","utok("+presunuta_karta.id+")");
            console.log(presunuta_karta.id);
            //

            hracovo_pole_vykladani.append(presunuta_karta);
            je_zakliknuta_karta=false;
            zakliknuta_karta=null;

            //tady začíná hrát protihráč
            protihrac_vybrani_random_karty();


        }
        else
            console.log("Chyba, zakliknuta_karta je rovna null. Ve funkci presunuti_karty()");
    }
    
    function pridani_karty(){
        if(pole_chybejicich_karet.length>0){
        let random = Math.floor(Math.random()*pole_karet.length)
        console.log(random);    
        hrac_objekty_karty[index_hrac_karty_objekty] = pole_karet[random];                      //Vybere se random karta objektová(např. spartan)
        
        if(index_hrac_karty_objekty>8)
            index_hrac_karty_objekty=0;
        const karty_hrace = document.getElementById("hracovy_karty");
        const nova_karta = document.createElement("img");
        const id_chybejici_karty = pole_chybejicich_karet.shift();
        hrac_objekty_karty[index_hrac_karty_objekty].id=id_chybejici_karty;
        console.log(hrac_objekty_karty[index_hrac_karty_objekty].id);
        nova_karta.setAttribute("id",id_chybejici_karty);
        nova_karta.setAttribute("class","karty vysouvani_karet"); 
        nova_karta.setAttribute("onclick","nakliknuto(\'"+id_chybejici_karty+"\')");
        nova_karta.setAttribute("src",hrac_objekty_karty[index_hrac_karty_objekty].img);
        karty_hrace.appendChild(nova_karta);  
        console.log(hrac_objekty_karty[index_hrac_karty_objekty]);  
        index_hrac_karty_objekty++;
        }
        //aby mohlo být jen 5 karet v inventáři
        else{
           document.getElementById("pridavani_karet").removeAttribute("onclick");
        }    
    }

    function protihrac_vybrani_random_karty(){
        if(protihrac_pole_chybejicich_karet.length>0){      //Kontrola, jestli je na středě místo
        let random = Math.floor(Math.random() * pole_karet_protihrace.length)+1;
        let id_random_karta = pole_karet_protihrace[random-1];
        let random_karta = document.getElementById(id_random_karta);
        pole_karet_protihrace.splice(random-1,1);
        random_karta.classList.add("vysouvani_karet_protihrace");
        const zpozdeni = setTimeout(protihrac_presunuti_karty, 1000);
        }
    }

    function protihrac_presunuti_karty(){
        const protihrac_prazdne_misto = protihrac_pole_chybejicich_karet.splice(0,1);
        const karta_na_vymazani = document.querySelector(".vysouvani_karet_protihrace");
        const protihrac_presunuta_karta = karta_na_vymazani;
        const protihracovo_pole_vykladani_karet = document.getElementById("pole_vykladani_protivnika");
        karta_na_vymazani.remove();//vymazání karty u hráče
        document.getElementById(protihrac_prazdne_misto).remove();//vymazání prázdného místa na středu
        protihrac_presunuta_karta.classList.remove("vysouvani_karet_protihrace")
        protihracovo_pole_vykladani_karet.append(protihrac_presunuta_karta);
        protihrac_utocne_karty.push(protihrac_presunuta_karta.id);
    }

    function utok(karta_utocna){
        console.log(karta_utocna);      //vyhodí img celou kartu prostě element 
        let utocna_karta_objekt=null;
        for(let i = 0;i<hrac_objekty_karty.length;i++){
            console.log(hrac_objekty_karty[i]);
                if(hrac_objekty_karty[i].id==karta_utocna.id){
                    console.log(karta_utocna.id);
                    utocna_karta_objekt = hrac_objekty_karty[i];      //předělání id u objektu při přesunu
                    break;
                }
            }
        for(let i =0; i < protihrac_utocne_karty.length;i++){
            document.getElementById(protihrac_utocne_karty[i]).setAttribute("onclick","snizeni_hp("+protihrac_utocne_karty[i]+", "+utocna_karta_objekt+")");
        }
    }

    function snizeni_hp(karta_objekt_snizeni,karta_utocna_objekt){
        console.log(karta_utocna_objekt);

    }


