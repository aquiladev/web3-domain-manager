import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

const POLLING_INTERVAL = 12000
const RPC_URLS = {
  1: process.env.RPC_URL_1,
  4: process.env.RPC_URL_4,
}

export const injected = new InjectedConnector({ supportedChainIds: [1, 4] });

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});