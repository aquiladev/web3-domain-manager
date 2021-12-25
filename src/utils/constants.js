export const DOMAIN_EVENTS = [
  'Approval',
  'NewURI',
  'Transfer'
];

export const CNS_DOMAIN_EVENTS = [
  ...DOMAIN_EVENTS,
  'Resolve',
  'Sync',
];

export const UNS_DOMAIN_EVENTS = [
  ...DOMAIN_EVENTS,
  'Set',
];

export const ETHERSCAN_MAP = {
  1: 'https://etherscan.io/',
  4: 'https://rinkeby.etherscan.io/',
  5: 'https://goerli.etherscan.io/',
  137: 'https://polygonscan.com/',
  80001: 'https://mumbai.polygonscan.com/',
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const CHAIN_ID_NETWORK = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  8: 'Ubiq',
  18: 'ThundercoreTestnet',
  42: 'Kovan',
  30: 'Orchid',
  31: 'OrchidTestnet',
  61: 'Classic',
  77: 'Sokol',
  99: 'Core',
  100: 'xDai',
  108: 'Thundercore',
  122: 'Fuse',
  137: 'Polygon Mainnet',
  163: 'Lightstreams',
  80001: 'Polygon Mumbai',
}
