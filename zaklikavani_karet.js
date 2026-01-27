var je_zakliknuta_karta =false;
var zakliknuta_karta = null;
var pole_chybejicich_karet = [];

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
        document.getElementById(id_prazdneho_mista).remove();
        document.getElementById(zakliknuta_karta).remove();
        
        pole_chybejicich_karet.push(zakliknuta_karta);//dává do pole id karty, která hráčovi chybí
        if(!document.getElementById("pridavani_karet").hasAttribute("onclick")) //přidání attributu, aby si hráč mohl nakliknout další kartu, když jich nemá 5
        {
            document.getElementById("pridavani_karet").setAttribute("onclick","pridani_karty()");
        }

        //predelani karty aby mela stejne classy jako ostatni v poli
        presunuta_karta.removeAttribute("onclick");
        presunuta_karta.classList.remove("zakliknuta_karta");
        presunuta_karta.id=id_prazdneho_mista;
        //

        hracovo_pole_vykladani.append(presunuta_karta);
         je_zakliknuta_karta=false;
        zakliknuta_karta=null;
     }
     else
         console.log("Chyba, zakliknuta_karta je rovna null. Ve funkci presunuti_karty()");
 }
    
    
function pridani_karty(){
    if(pole_chybejicich_karet.length>0){
    const karty_hrace = document.getElementById("hracovy_karty");
    const nova_karta = document.createElement("img");
    const id_chybejici_karty = pole_chybejicich_karet.shift();
    nova_karta.setAttribute("id",id_chybejici_karty);
    nova_karta.setAttribute("class","karty vysouvani_karet"); 
    nova_karta.setAttribute("onclick","nakliknuto(\'"+id_chybejici_karty+"\')");
    nova_karta.setAttribute("src","spartan.jpg");
    karty_hrace.appendChild(nova_karta);       
    }
    //aby mohlo být jen 5 karet v inventáři
    else{
       document.getElementById("pridavani_karet").removeAttribute("onclick");
    }    
}