import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

// Define the type for Participant
interface Participant {
  id: number;
  name: string;
  category: string;
  age: number;
}

// Sample Data with categories
const participants: Participant[] = [
  { id: 1, name: "John Doe", category: "A", age: 28 },
  { id: 2, name: "Jane Smith", category: "B", age: 34 },
  { id: 3, name: "Alice Johnson", category: "A", age: 25 },
  { id: 4, name: "Bob Brown", category: "C", age: 40 },
  { id: 5, name: "Charlie Davis", category: "B", age: 22 },
];

const GroupedTable = () => {
  // Group participants by category
  const groupedData: { [key: string]: Participant[] } = participants.reduce((acc, participant) => {
    const { category } = participant;
    if (!acc[category]) acc[category] = [];
    acc[category].push(participant);
    return acc;
  }, {} as { [key: string]: Participant[] });

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="grouped table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Age</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(groupedData).map((category) => (
            <React.Fragment key={category}>
              {/* Render category header */}
              <TableRow>
                <TableCell colSpan={3} style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
                  {category}
                </TableCell>
              </TableRow>

              {/* Render rows for this category */}
              {groupedData[category].map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.age}</TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GroupedTable;
