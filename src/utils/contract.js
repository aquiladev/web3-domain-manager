export function createContract(library, chainId, abi, config) {
  const contract = new library.eth.Contract(abi, config.address);
  contract._chainId = chainId;
  contract._config = config;
  return contract;
}
