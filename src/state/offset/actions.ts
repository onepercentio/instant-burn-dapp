import { createAction } from '@reduxjs/toolkit'
import { Token, TokenAmount } from '@ubeswap/sdk'

export const typeInput =
  createAction<{ typedValue: string; token: Token | undefined; parsedValue: TokenAmount | undefined }>(
    'offset/typeInput'
  )
export const approveInstantBurn = createAction<void>('offset/approveInstantBurn')
export const doBurn = createAction<void>('offset/burn')
