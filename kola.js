const MAX_KOL = 0;
let zbyvajiciKola = MAX_KOL;
let hracuvTah = true;


function DalsiKolo(){
    zbyvajiciKola--;
  
    if (zbyvajiciKola <= 0 ){
        alert("Konec hry");
    }

    hracuvTah = !hracuvTah;
}
