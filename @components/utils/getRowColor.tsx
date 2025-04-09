export default function getRowColor(status: string | null) {
    switch (status) {
        case "Delantero": return "#80ccff"; 
        case "Centrocampista": return "#83ff80"; 
        case "Defensa": return  "#ffee80" ; 
        case "Portero": return "#ff9380 "; 
        default: return "#fafafa";
    }
};