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

    const filtersMap = {
      Approval: (tokenId) => this.contract.filters.Approval(undefined, undefined, tokenId),
      NewURI: (tokenId) => this.contract.filters.NewURI(tokenId),
      Transfer: (tokenId) => this.contract.filters.Transfer(undefined, undefined, tokenId),
      Resolve: (tokenId) => this.contract.filters.Resolve(tokenId),
      Sync: (tokenId) => this.contract.filters.Sync(undefined, undefined, tokenId),
      Set: (tokenId) => this.contract.filters.Set(tokenId),
    };

    let current = 1;
    return Promise.all(
      eventsToFetch.map((event) => {
        const filter = filtersMap[event](domain.id);
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
    return this._fetchEvents(this.contract, filter, parseInt(this.config.deploymentBlock, 16));
  }

  async fetchNewURIEvents(tokenOrArray) {
    const filter = this.contract.filters.NewURI(tokenOrArray);
    return this._fetchEvents(this.contract, filter, parseInt(this.config.deploymentBlock, 16));
  }

  async _fetchEvents(contract, filter, fromBlock, toBlock, limit = 1000000) {
    if (!toBlock) {
      toBlock = await contract.provider.getBlockNumber();
    }
  
    if(fromBlock > toBlock) {
      return [];
    }
  
    const _toBlock = Math.min(fromBlock + limit, toBlock);
    console.log(`Fetching events blocks [${contract.address}: ${fromBlock}-${_toBlock}][limit: ${limit}]`);
  
    try {
      const events = await contract.queryFilter(filter, fromBlock, _toBlock);
      const nextLimit = Math.min(Math.floor(limit * 2), 1000000);
      return events.concat(await this._fetchEvents(contract, filter, _toBlock + 1, toBlock, nextLimit));
    } catch (err) {
      if (err.message.includes('query returned more than 10000 results') || err.message.includes('timeout')) {
        return this._fetchEvents(contract, filter, fromBlock, toBlock, Math.floor(limit / 10));
      }
  
      console.log('FAIL', err);
      throw err;
    }
  }

  _progress(data) {
    this.onProgressObservers.forEach(fn => fn(data));
  }
}
