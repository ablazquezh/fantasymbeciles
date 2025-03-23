import React from 'react'
import { type CardProps } from '@mui/material'
import Image, { type StaticImageData } from 'next/image'
import RowStretch from '../layout/RowStretch'
import Title from '../text/Title'
import ColumnSpaceBetweenAlignStart from '../layout/ColumnSpaceBetweenAlignStart'
import MercadonaIcon from '../../public/static/mercadona.png'
import CarrefourIcon from '../../public/static/carrefour.png'
import DiaIcon from '../../public/static/dia.png'
import EroskiIcon from '../../public/static/eroski.png'
import AhorramasIcon from '../../public/static/ahorramas.png'
import NoImageIcon from '../../public/static/no-image.png'
import { useTheme } from '@mui/material'
import RowSpaceBetweenStretch from '../layout/RowSpaceBetweenStretch'
import ColumnSpaceBetweenAlignEnd from '../layout/ColumnSpaceBetweenAlignEnd'
import Card from './Card'
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function getIcon(name: string): StaticImageData {
  switch (name.toLowerCase()) {
    case 'mercadona':
      return MercadonaIcon
    case 'carrefour':
      return CarrefourIcon
    case 'dia':
      return DiaIcon
    case 'eroski':
      return EroskiIcon
    case 'ahorramas':
      return AhorramasIcon
    default:
      return NoImageIcon
  }
}

export interface ProductCardProps extends CardProps {
  marketName: string
  marketPrice: number
  marketMenuSelectHandler: (marketName: string) => void
  missingProducts: boolean
  height?: number
  width?: number
}

const CARD_HEIGHT = 100

export default function MarketCard({
  marketName,
  marketPrice,
  marketMenuSelectHandler,
  missingProducts,
  height = CARD_HEIGHT,
  // ...props
}: ProductCardProps): React.ReactElement {
  const theme = useTheme()


  return (

    <Card sx={{
      width: 500,
      overflow: "visible",
      margin: "auto"
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
            src={getIcon(marketName)}
            alt={marketName}
            height={height}
            width={height}
          />
          <ColumnSpaceBetweenAlignStart>
            <Title>{marketName}</Title>
          </ColumnSpaceBetweenAlignStart>
        </RowStretch>
        <ColumnSpaceBetweenAlignEnd sx={{ margin: theme.spacing(0.5) }}>
          <Title>{marketPrice.toFixed(2) + '€'}</Title>
          {(() => {
            if (missingProducts) {
              return (
                <Tooltip title="Alguno de los productos que has indicado no se han encontrado en este supermercado. Mira los resultados para más detalle.">
                  <ErrorOutlineIcon sx={{ color: "#e91e63" }} />
                </Tooltip>
              )
            }
          })()}
        </ColumnSpaceBetweenAlignEnd>
      </RowSpaceBetweenStretch>

      <CardActions disableSpacing>
        <Button size="small" onClick={() => {
          marketMenuSelectHandler(marketName)
        }}>Ver resultados</Button>
      </CardActions>
    </Card>

  )
}
