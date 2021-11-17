/**
 * @TODO add list from blockchain association
 */
export const UNSUPPORTED_LIST_URLS: string[] = []

const UBESWAP_LIST = 'https://raw.githubusercontent.com/Ubeswap/default-token-list/master/ubeswap.token-list.json'
const UBESWAP_EXPERIMENTAL_LIST =
  'https://raw.githubusercontent.com/Ubeswap/default-token-list/master/ubeswap-experimental.token-list.json'
const UNISWAP_LIST = 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'

export const CARBON_OFFSET_LIST = {
  tokens: [
    {
      address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
      name: 'Celo Dollar',
      symbol: 'cUSD',
      chainId: 42220,
      decimals: 18,
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cUSD.png',
    },
    {
      address: '0x32A9FE697a32135BFd313a6Ac28792DaE4D9979d',
      name: 'Celo Moss Carbon Credit',
      symbol: 'cMCO2',
      chainId: 42220,
      decimals: 18,
      logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_cMCO2.png',
    },
  ],
}
// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  UBESWAP_LIST,
  UBESWAP_EXPERIMENTAL_LIST,
  UNISWAP_LIST,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [UBESWAP_LIST, UNISWAP_LIST]
