export const DOMAIN_EVENTS = [
  'Approval',
  'NewURI',
  'Transfer'
];

export const CNS_DOMAIN_EVENTS = [
  ...DOMAIN_EVENTS,
  'Resolve', // CNS
  'Sync',    // CNS
];

export const UNS_DOMAIN_EVENTS = [
  ...DOMAIN_EVENTS,
  'Set',     // UNS
];

export const ETHERSCAN_MAP = {
  1: 'https://etherscan.io/',
  4: 'https://rinkeby.etherscan.io/',
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const CHAIN_ID_NETWORK = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan',
  100: 'xDai',
  30: 'Orchid',
  31: 'OrchidTestnet',
  99: 'Core',
  77: 'Sokol',
  61: 'Classic',
  8: 'Ubiq',
  108: 'Thundercore',
  18: 'ThundercoreTestnet',
  163: 'Lightstreams',
  122: 'Fuse',
  15001: 'MaticTestnet'
}
