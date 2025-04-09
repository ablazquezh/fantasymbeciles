import { RowData } from "../types/RowData";

const positionList = ["Delantero", "Centrocampista", "Defensa", "Portero"];
export default function groupPlayerData (playerData: RowData[]) {
  
    const groupedData: { [key: string]: RowData[] } = positionList.reduce((acc, pos) => {
      acc[pos] = [];
      return acc;
    }, {} as { [key: string]: RowData[] });
  

    playerData.forEach((player) => {
      const key = player.global_position;
      if (key) {
        if (!groupedData[key]) groupedData[key] = []; // If key not predefined
        groupedData[key].push(player);
      }
    });
  
    return groupedData;
};