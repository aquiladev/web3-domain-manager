import { ethers } from 'ethers';

import EthereumEventSource from '../sources/ethereum';

export function createContract(library, chainId, abi, config) {
  const contract = new ethers.Contract(config.address, abi, library);
  contract._chainId = chainId;
  contract._config = config;

  contract.source = new EthereumEventSource(library, chainId, contract);
  contract.source.onProgress(console.log);
  return contract;
}
