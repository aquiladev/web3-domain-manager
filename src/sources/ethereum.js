import NetworkConfig from 'uns/uns-config.json';

import { CNS_DOMAIN_EVENTS, UNS_DOMAIN_EVENTS } from './../utils/constants';

export default class EthereumEventSource {
  constructor(library, chainId, contract) {
    this.library = library;
    this.chainId = chainId;
    this.contract = contract;

    const { contracts } = NetworkConfig.networks[chainId];
    const config = Object.values(contracts)
      .find(x => x.address.toLowerCase() === contract.address.toLowerCase());
    if(!config) {
      throw new Error(`Config of contract ${contract.address} not found (chainId: ${chainId})`);
    }
    this.config = config;

    this.onProgressObservers = [];
  }

  onProgress(fn) {
    this.onProgressObservers.push(fn);
  }

  async fetchEvents(domain) {
    const eventsToFetch = domain.type.toLowerCase() === 'uns'
      ? UNS_DOMAIN_EVENTS
      : CNS_DOMAIN_EVENTS;

    let current = 1;
    return Promise.all(
      eventsToFetch.map((event) => {
        const filter = this.contract.filters[event](domain.id);
        return this.contract.queryFilter(filter, this.config.deploymentBlock)
          .then(this._progress({
            loaded: current++,
            total: eventsToFetch.length
          }));
      })
    ).then(x => x.flat().sort((a, b) => a.blockNumber - b.blockNumber));
  }

  async fetchTransferEvents(address) {
    const filter = this.contract.filters.Transfer(undefined, address);
    return this.contract.queryFilter(filter, this.config.deploymentBlock);
  }

  async fetchNewURIEvents(tokenOrArray) {
    const filter = this.contract.filters.NewURI(tokenOrArray);
    return this.contract.queryFilter(filter, this.config.deploymentBlock);
  }

  _progress(data) {
    this.onProgressObservers.forEach(fn => fn(data));
  }
}
