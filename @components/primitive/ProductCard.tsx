import React, { useState } from 'react'
import { type CardProps, Chip } from '@mui/material'

// import type Product from '../@types/Product'
import {type Product} from '../../gql/graphql'

import Image, { type StaticImageData } from 'next/image'
import RowStretch from '../layout/RowStretch'
// import Title from '../text/Title'
import Caption from '../text/Caption'
import ColumnSpaceBetweenAlignStart from '../layout/ColumnSpaceBetweenAlignStart'
import MercadonaIcon from '../../public/static/mercadona.png'
import CarrefourIcon from '../../public/static/carrefour.png'
import DiaIcon from '../../public/static/dia.png'
import NoImageIcon from '../../public/static/no-image.png'
import { useTheme } from '@mui/material'
import RowSpaceBetweenStretch from '../layout/RowSpaceBetweenStretch'
import ColumnSpaceBetweenAlignEnd from '../layout/ColumnSpaceBetweenAlignEnd'
// import ClickableCard from './ClickableCard'
import Card from './Card'
import ShimmerLoadingCard from './ShimmerLoadingCard'
// import { constants } from 'zlib'
// import BROTLI_DECODER_PARAM_LARGE_WINDOW = module
import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip'
import Row from '../layout/Row'
import Nothing from '../../public/static/nothing.png'
import ColumnStretch from '../layout/ColumnStretch'
import ProductName from '../text/ProductName'
import ProductPrice from '../text/ProductPrice'
import ProductStrikeTrough from '../text/ProductStrikeThrough'
import FavoriteIcon from '@mui/icons-material/Favorite';
import IconButton from '@mui/material/IconButton'

function getIcon(name: string): StaticImageData {
  switch (name.toLowerCase()) {
    case 'mercadona':
      return MercadonaIcon
    case 'carrefour':
      return CarrefourIcon
    case 'dia':
      return DiaIcon
    default:
      return NoImageIcon
  }
}

export interface ProductCardProps extends CardProps {
  product: Product
  height?: number
  width?: number

  productListIndex?: number
  productInfoTuple?: [string, string] // [marketName, productName]

  selectedIndex?: number

  modalHandler?: (i: number) => void
  modalHandlerRecord?: (productInfoTuple: [string, string]) => void

  selectHandler?: (i: number) => void

  showChangeButton?: boolean
}

const CARD_HEIGHT = 100

export default function ProductCard({
  product,
  modalHandler,
  modalHandlerRecord,
  selectHandler,
  selectedIndex,
  productListIndex,
  productInfoTuple,
  showChangeButton,
  height = CARD_HEIGHT,
  ...props
}: ProductCardProps): React.ReactElement {
  const theme = useTheme()

  const [favourite, setFavourite] = useState(false)
  function handleFavouriteClick():void {
       setFavourite(!favourite)
  }

  return (
    <Card sx={{
      width: 500,
      overflow: "visible",
      margin: "auto",
      marginTop: 0.5
    }}>
      <RowSpaceBetweenStretch
        sx={{
          height,
          width: 500,
          margin: theme.spacing(1),
        }}
      >
        <RowStretch sx={{ marginRight: 2 }}>
          <Image
            style={{ objectFit: 'contain' }}
            src={product.imageUrl ?? getIcon('')}
            alt={product.name}
            height={height}
            width={height}
          />
          <ColumnSpaceBetweenAlignStart sx={{ marginLeft: 1 }}>
            <ProductName>{product.name}</ProductName>
            <Caption sx={{ overflow: 'hidden' }}>{product.description}</Caption>

            {(() => {
              if (product.discountPrice == null) {
                return (
                  <ProductPrice>{product.price.toFixed(2) + '€'}</ProductPrice>
                )
              } else {
                return (
                  <RowStretch sx={{ marginTop: 0.6 }}>
                    <ProductStrikeTrough>{product.price.toFixed(2) + '€'}</ProductStrikeTrough>
                    <ProductPrice sx={{color: "#ff0000", fontWeight: 'bold'}}>{product.discountPrice.toFixed(2) + '€'}</ProductPrice>
                  </RowStretch>
                )
              }
            })()}

          </ColumnSpaceBetweenAlignStart>

        </RowStretch>

        <ColumnSpaceBetweenAlignEnd sx={{ marginRight: 2 }}>

          <RowStretch>
            {(() => {
              if (product.discountPrice != null) {
                return (
                  <Chip label="Descuento" variant="outlined" color="warning" size="small" sx={{ margin: "auto", marginRight: 1.5 }} />              )
              }
            })()}

            <IconButton aria-label="favourite" onClick={handleFavouriteClick}>
              {favourite ? <FavoriteIcon style={{ color: 'red' }} /> : <FavoriteIcon /> }
            </IconButton>

          </RowStretch>

          {(() => {
            if (selectHandler != null && selectedIndex != null){
              return (
                <CardActions disableSpacing>
                  <Button size="small" onClick={() => {
                    selectHandler(selectedIndex)
                  }}>Seleccionar</Button>
                </CardActions>
            )}else if (modalHandlerRecord != null && productInfoTuple != null && showChangeButton != null){
              return (
                <CardActions sx={{ padding: 0 }} disableSpacing>
                  {(() => {
                    if (showChangeButton) {
                      return (
                        <Button variant="contained" onClick={() => {
                                  modalHandlerRecord(productInfoTuple)
                        }}>Cambiar</Button>
                      )
                    }else{
                      return (
                        <Tooltip title="No se han encontrado más productos como este.">
                          <span>
                            <Button disabled variant="contained">Cambiar</Button>
                          </span>
                        </Tooltip>
                      )
                    }
                  })()}

                </CardActions>
              )}
          })()}
        </ColumnSpaceBetweenAlignEnd>

      </RowSpaceBetweenStretch>

    </Card>

  )
}

export function ProductLoadingCard({
  sx,
  ...props
}: CardProps): React.ReactElement {
  const theme = useTheme()

  return (
    <ShimmerLoadingCard
      sx={{
        padding: theme.spacing(2),
        height: CARD_HEIGHT,
        ...sx,
      }}
      elevation={0}
      {...props}
    />
  )
}
