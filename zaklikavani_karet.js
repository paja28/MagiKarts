var je_zakliknuta_karta =false;
    var zakliknuta_karta = null;
    function nakliknuto(id){
        let karta = document.getElementById(id);
        
        //karta.classList.toggle("zakliknuta_karta");       
        //karta.classList.toggle("karty");              Nefunguje, nevím proč
        
        if(!je_zakliknuta_karta)
        {
            je_zakliknuta_karta=true;
            zakliknuta_karta = id;
            karta.classList.add("zakliknuta_karta");
            karta.classList.remove("vysouvani_karet");
        }
        else{
            if(zakliknuta_karta==id)  {          //kontrola jestli hráč kliknul na již vysunutou kartu
                je_zakliknuta_karta=false;
                karta.classList.remove("zakliknuta_karta");
                karta.classList.add("vysouvani_karet");                //Přidat sem, aby se classa vysouvani_karet přidala o vteřinu cca později, bude to mít lepší efekt
                zakliknuta_karta ="";
            }
            else
            {
                document.getElementById(zakliknuta_karta).classList.add("vysouvani_karet");
                document.getElementById(zakliknuta_karta).classList.remove("zakliknuta_karta");
                karta.classList.add("zakliknuta_karta");
                karta.classList.remove("vysouvani_karet");
                zakliknuta_karta = id;
            }
        }
            
    }