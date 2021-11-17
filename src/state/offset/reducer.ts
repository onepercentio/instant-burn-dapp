import { createReducer } from '@reduxjs/toolkit'
import { Token, TokenAmount } from '@ubeswap/sdk'

import { typeInput } from './actions'

export interface OffsetState {
  readonly typedValue: string
  readonly token: Token | undefined
  readonly recipient: string | null
  readonly parsedValue: TokenAmount | undefined
}

const initialState: OffsetState = {
  typedValue: '',
  token: undefined,
  recipient: null,
  parsedValue: undefined,
}

export default createReducer<OffsetState>(initialState, (builder) =>
  builder.addCase(typeInput, (state, { payload: { typedValue, token, parsedValue } }) => {
    return {
      ...state,
      typedValue,
      parsedValue,
    }
  })
)
