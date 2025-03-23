import * as React from 'react';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  type GridRowsProp,
  type GridRowModesModel,
  GridRowModes,
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
  type GridRowId,
  type GridRowModel
} from '@mui/x-data-grid'
import EditToolbar from './InputTableToolbar'
import { getMinPriceProductByName } from '../../gql_queries'
import { type Product } from '../../gql/graphql'
import { useQuery, type UseQueryResult } from 'react-query'
import {request} from "graphql-request"
import { useEffect } from 'react'

const initialRows: GridRowsProp = [];

function useProductQuery(

  search: string,
  searchFunction?: (search: string) => Promise<Product | null | undefined>
): UseQueryResult<Product, Error> {

  searchFunction ??= async( search: string) => {

    const product = await request("http://127.0.0.1:5000/graphql", getMinPriceProductByName, { name: search })

    return product.product
  }

  return useQuery(
    ['cheapestProduct', search],
    async () => await searchFunction?.(search),
    {
      enabled: search.length > 0, retry: false
    }
  )
}

export interface InputTableProps {
  productMap?: Map<number, Product>
  searchProduct?: (search: string) => Promise<Product>
  // search?: string
  search?: { rowId: number, searchTerm: string }
}

export default function FullFeaturedCrudGrid({productMap = new Map<number, Product>(),
                                               search = {rowId: 0, searchTerm: ''},// '',
                                               searchProduct}: InputTableProps) {

  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const [searchTerm, setSearchTerm] = React.useState(search)
  const [productsResult, setProductsResult] = React.useState(productMap)

  // ToDo: handle isLoading status of the query.
  const { error, data } = useProductQuery(
    searchTerm?.searchTerm,
    searchProduct
  )

  useEffect(() => {
    if(data != null){
      setProductsResult(productsResult.set(searchTerm?.rowId, data));
      console.log(productsResult)
    }
  }, [data, error])

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    // If you cancel a row that was being added, it is removed
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow !== undefined && editedRow.isNew === true) {
      setRows(rows.filter((row) => row.id !== id))
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    const newRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
    setRows(newRows);

    // Check if there was an actual change as a result of the event. If true -> a change took place and a query must be sent.
    const changed = !rows.every((r1) =>
      newRows.some(
        (r2) =>
          r1.name === r2.name &&
          r1.brand === r2.brand
      )
    );

    if(changed) {
      setSearchTerm({ rowId: newRow.id, searchTerm: newRow.name })
    }

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nombre',
      width: 180,
      editable: true },
    {
      field: 'brand',
      headerName: 'Marca',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        marginTop: 4,
        marginBottom: 4,
         width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <DataGrid
        onProcessRowUpdateError={(error) => { console.log(error); }}
        autoHeight
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } }
        }}
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel, productsResult },
        }}
      />
    </Box>
  );
}
