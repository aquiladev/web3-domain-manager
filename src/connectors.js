import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

export const POLLING_INTERVAL = 12000
const RPC_URLS = {
  1: 'https://mainnet.infura.io/v3/3947c045ca5a4d68bff484fb038fb11c',
  4: 'https://rinkeby.infura.io/v3/3947c045ca5a4d68bff484fb038fb11c',
  137: 'https://polygon-mainnet.infura.io/v3/3947c045ca5a4d68bff484fb038fb11c',
  80001: 'https://polygon-mumbai.infura.io/v3/3947c045ca5a4d68bff484fb038fb11c',
}

export const injected = new InjectedConnector({ supportedChainIds: [1, 4] });

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'Web3 Domain Manager',
  supportedChainIds: [1, 4]
})
