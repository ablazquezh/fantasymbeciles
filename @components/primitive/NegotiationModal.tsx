import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";
import { useState } from "react";

export default function NegotiationModal() {
    const [dealModalOpen, setDealModalOpen] = useState(false);
    const [value, setValue] = useState<number>(0);
    const [resolveFn, setResolveFn] = useState<((value: number | null) => void) | null>(null);
  
    // Close the modal without saving
  const handleDealModalClose = () => {
    setDealModalOpen(false);
    resolveFn?.(-1); // cancel
  };

  // Handle the change in the TextField
  const handleDealModalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Only update if the value is a number or empty
    if (/^\d*$/.test(newValue)) {
        setValue(Number(newValue));
    }
  };

  // Save the value and close the modal
  const handleDealModalSave = () => {
    setDealModalOpen(false); // Close modal    
    resolveFn?.(value); // save
  };

    const prompt = (defaultValue: number = 0) =>
      new Promise<number | null>((resolve) => {
        setValue(defaultValue); // Reset input
        setDealModalOpen(true);
        setResolveFn(() => resolve); // Save resolver to call later
      });

    const Modal = (<Dialog open={dealModalOpen} onClose={handleDealModalClose}>
        <DialogContent>
        <TextField
            label="Valor de venta"
            variant="outlined"
            fullWidth
            value={value}
            onChange={handleDealModalChange}
            inputProps={{
            inputMode: "numeric", // Mobile-specific number input
            pattern: "[0-9]*",    // For browsers that don't support inputMode
            }}
        />
        </DialogContent>
        <DialogActions>
        <Button onClick={handleDealModalClose} >
            Cancelar venta
        </Button>
        <Button onClick={handleDealModalSave} sx={{color:"black", backgroundColor:"lightgray"}}>
            Vender
        </Button>
        </DialogActions>
    </Dialog>
    );

    return {prompt, Modal}

}