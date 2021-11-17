import { useContractKit } from '@celo-tools/use-contractkit'
import { CELO, ChainId as UbeswapChainId, TokenAmount } from '@ubeswap/sdk'
import ChangeNetworkModal from 'components/ChangeNetworkModal'
import { ContractTransaction } from 'ethers'
import useENS from 'hooks/useENS'
import { useIsSupportedNetwork } from 'hooks/useIsSupportedNetwork'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'rebass'
import { useOffsetCallback } from 'state/offset/useOffsetCallback'
import { useCurrencyBalance } from 'state/wallet/hooks'
import styled, { ThemeContext } from 'styled-components'

import { ButtonConfirmed, ButtonError } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import Loader from '../../components/Loader'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import ProgressSteps from '../../components/ProgressSteps'
import { AutoRow, RowBetween } from '../../components/Row'
import { BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import SwapHeader from '../../components/swap/SwapHeader'
import { useAllTokens } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { useOffsetActionHandlers, useOffsetInfo, useOffsetState } from '../../state/offset/hooks'
import { useExpertModeManager } from '../../state/user/hooks'
import AppBody from '../AppBody'

export default function Burn() {
  const { t } = useTranslation()

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)

  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()

  const { address: account, network } = useContractKit()
  const chainId = network.chainId as unknown as UbeswapChainId
  const isSupportedNetwork = useIsSupportedNetwork()

  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  // const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { typedValue, recipient, parsedValue } = useOffsetState()
  const { address: recipientAddress } = useENS(recipient)

  const { onUserInput } = useOffsetActionHandlers()

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(value)
    },
    [onUserInput]
  )
  // modal and loading
  const [{ showConfirm, offsetErrorMessage, attemptingTxn, txHash }, setOffsetState] = useState<{
    showConfirm: boolean
    attemptingTxn: boolean
    offsetErrorMessage: string | undefined
    txHash: ContractTransaction | undefined
  }>({
    showConfirm: false,
    attemptingTxn: false,
    offsetErrorMessage: undefined,
    txHash: undefined,
  })

  const { carbonToken, offsetContract } = useOffsetInfo()

  const { offsetCallback, offsetCallbackError } = useOffsetCallback()

  // const noRoute = !route

  // check whether the user has approved the router on the input token
  const tokenAmount = parsedValue
  // const test = new TokenAmount(carbonToken!, '0')
  const [approval, approveCallback, currentAllowance] = useApproveCallback(tokenAmount, offsetContract)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: TokenAmount | undefined = useCurrencyBalance(account ?? undefined, carbonToken ?? undefined)
  const atMaxAmountInput = Boolean(maxAmountInput && tokenAmount?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const handleOffset = useCallback(() => {
    setOffsetState({ attemptingTxn: true, showConfirm, offsetErrorMessage: undefined, txHash: undefined })

    if (parsedValue?.equalTo('0')) {
      return
    }
    offsetCallback(parsedValue!.raw.toString())
      .then((hash) => {
        setOffsetState({ attemptingTxn: false, showConfirm, offsetErrorMessage: undefined, txHash: hash })
        //TODO: check if we add Google Analytics back here
      })
      .catch((error) => {
        console.error(error)
        setOffsetState({
          attemptingTxn: false,
          showConfirm,
          offsetErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [offsetCallback, showConfirm, recipient, recipientAddress, account])
  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !isExpertMode

  const handleConfirmDismiss = useCallback(() => {
    // setOffsetState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput('')
    }
  }, [attemptingTxn, onUserInput, txHash])

  const handleAcceptChanges = useCallback(() => {
    setOffsetState({ offsetErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, offsetErrorMessage, txHash])

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      if (carbonToken?.address === CELO[chainId].address) {
        onUserInput(Math.max(Number(maxAmountInput.toExact()) - 0.01, 0).toString())
      } else {
        onUserInput(maxAmountInput.toExact())
      }
    }
  }, [maxAmountInput, onUserInput, carbonToken, chainId])

  // const actionLabel = t(makeLabel(independentField !== Field.INPUT))

  if (!isSupportedNetwork) {
    return <ChangeNetworkModal />
  }

  const Message = styled.p`
    font-size: 10pt;
    padding: 10px;
  `
  return (
    <>
      {/* <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      /> */}
      <SwapPoolTabs active={'swap'} />
      <AppBody>
        <SwapHeader title="Carbon Offset - Burn" />
        <Wrapper id="swap-page">
          {/* <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleOffset}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          /> */}
          <Message>
            The Burn step requires you to approve an amount to Instant Burn contract and then call a Burn method. The
            contract bridges MCO2 from Celo network to Ethereum network and burns the authorized amount of tokens.
          </Message>
          <AutoColumn gap={'md'}>
            <CurrencyInputPanel
              value={typedValue}
              onUserInput={handleTypeInput}
              label="MCO2"
              showMaxButton={!atMaxAmountInput}
              currency={carbonToken}
              disableCurrencySelect={true}
              onMax={handleMaxInput}
              id="swap-currency-output"
            />
          </AutoColumn>
          <BottomGrouping>
            {showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + carbonToken?.symbol
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    handleOffset()
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={approval !== ApprovalState.APPROVED}
                  error={false}
                >
                  {' '}
                  Burn
                </ButtonError>
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  handleOffset()
                }}
                id="swap-button"
                disabled={maxAmountInput?.equalTo('0')}
                error={false}
              >
                <Text fontSize={20} fontWeight={500}>
                  {maxAmountInput?.equalTo('0') ? 'No funds in account' : 'Proceed with offset'}
                </Text>
              </ButtonError>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
              </Column>
            )}
            {isExpertMode ? <SwapCallbackError error={offsetErrorMessage ?? ''} /> : null}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
    </>
  )
}
