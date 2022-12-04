import { ethers } from "ethers";

import EthereumEventSource from "../sources/ethereum";

export function createContract(library, chainId, abi, config) {
  const provider = new ethers.providers.Web3Provider(library.provider);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(config.address, abi, signer);

  contract.source = new EthereumEventSource(library, chainId, contract);
  contract.source.onProgress(console.log);
  return contract;
}
