import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

import { config } from "./utils/config";

export const POLLING_INTERVAL = 12000;

export const injected = new InjectedConnector({
  supportedChainIds: [1, 5, 137, 80001],
});

export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: config[1].rpcUrl,
    5: config[5].rpcUrl,
    137: config[137].rpcUrl,
    80001: config[80001].rpcUrl,
  },
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});

export const walletlink = new WalletLinkConnector({
  url: config[1].rpcUrl,
  appName: "Web3 Domain Manager",
  supportedChainIds: [1, 5, 137, 80001],
});
