import {
  GridRowModes,
  type GridRowModesModel,
  type GridRowsProp,
  GridToolbarContainer,
} from '@mui/x-data-grid'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import SendIcon from '@mui/icons-material/Send'
import * as React from 'react'
import { type Product } from '../../gql/graphql'
import Link from 'next/link'

let idCount= 0;

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void;
  productsResult: Map<number, Product>
}

function EditToolbar(props: EditToolbarProps) {

  const { setRows, setRowModesModel, productsResult} = props;

  const handleAddClick = () => {
    /* ToDo: do not allow to open more new rows while there is still an unsaved one.
      Maybe disable the "ADD" button while it is active OR another row is being edited.
      To complete an action, I should AT LEAST provide a product name AND,
      either click away OR click on the row's "SAVE" icon. */
    const currentId = idCount;
    idCount += 1;
    setRows((oldRows) => [...oldRows, { id: currentId, name: '', brand: '', isNew: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [currentId]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };
  const resultList = Array.from(productsResult.values());

  return (
    <GridToolbarContainer>
      <Button sx={{ marginLeft: "auto" }}
              color="primary" startIcon={<AddIcon />} onClick={handleAddClick}>
        Añadir producto
      </Button>
      <Link href={{ pathname: '/seeResult', query: { resultList: JSON.stringify(resultList) } }}>
        <Button variant="contained" endIcon={<SendIcon />} href = "/searchView">
          Enviar
        </Button>
      </Link>
    </GridToolbarContainer>
  );
}

export default EditToolbar;