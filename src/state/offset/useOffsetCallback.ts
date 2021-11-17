import { useContractKit, useProvider } from '@celo-tools/use-contractkit'
import { BigNumberish } from '@ethersproject/bignumber'
import { useDoTransaction } from 'components/swap/routing'
import { ContractTransaction } from 'ethers'
import { getCarbonOffsetContract } from 'utils'

export enum OffsetCallbackState {
  INVALID,
  LOADING,
  VALID,
}

export function useOffsetCallback(): {
  offsetCallback: (amount: BigNumberish) => Promise<ContractTransaction>
  offsetCallbackError: string
} {
  const doTransaction = useDoTransaction()
  const { address: account, network } = useContractKit()
  const library = useProvider()
  const offsetContract = getCarbonOffsetContract(network.chainId, library, account!)
  const offsetCallback = (amount: BigNumberish) =>
    doTransaction(offsetContract, 'offsetCarbon', {
      args: [amount, 'Offset using celo Dapp', account!],
    })
  // const offsetCallback = (amount: BigNumberish) => offsetContract.offsetCarbon(amount, 'Offset using Celo Dapp', account!)

  return {
    offsetCallback,
    offsetCallbackError: '',
  }
}
