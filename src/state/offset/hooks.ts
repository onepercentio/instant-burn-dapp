import { useContractKit } from '@celo-tools/use-contractkit'
import { Token } from '@ubeswap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { tryParseAmount } from 'state/swap/hooks'

import { CARBON_OFFSET_ADDRESS, CMCO2 } from '../../constants'
import { useCurrency } from '../../hooks/Tokens'
import { AppDispatch, AppState } from '../index'
import { typeInput } from './actions'

export function useOffsetState(): AppState['offset'] {
  return useSelector<AppState, AppState['offset']>((state) => state.offset)
}

export function useOffsetActionHandlers(): {
  onUserInput: (typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const { network } = useContractKit()
  const token = useCurrency(CMCO2[network.chainId].address)
  const onUserInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ typedValue, token, parsedValue: tryParseAmount(typedValue, token) }))
    },
    [dispatch, token]
  )

  return {
    onUserInput,
  }
}

export function useOffsetInfo(): {
  carbonToken: Token | null | undefined
  offsetContract: string
} {
  const { network } = useContractKit()

  return {
    carbonToken: useCurrency(CMCO2[network.chainId].address), //cMCO2 address
    offsetContract: CARBON_OFFSET_ADDRESS[network.chainId],
  }
}
