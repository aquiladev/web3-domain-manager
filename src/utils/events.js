import {
  CREATION_BLOCK_MAP,
  DOMAIN_EVENTS
} from './constants';

export async function fetchDomainEvents(library, contract, domainId) {
  const chainId = await library.eth.getChainId();
  return Promise.all(DOMAIN_EVENTS.map((event) => {
    return fetchEvents(
      contract,
      event,
      { tokenId: domainId },
      CREATION_BLOCK_MAP[chainId]
    );
  })).then(x => x.flat().sort((a, b) => a.blockNumber - b.blockNumber));
}

export async function fetchTransferEvents(library, contract, account) {
  const chainId = await library.eth.getChainId();
  return fetchEvents(
    contract,
    'Transfer',
    { to: account },
    CREATION_BLOCK_MAP[chainId]
  );
}

export async function fetchEvents(contract, event, filter, fromBlock) {
  return contract.getPastEvents(event, {
    filter,
    fromBlock,
  }, async (error, events) => {
    if (error) {
      console.error(error);
      return Promise.reject(error);
    }

    return Promise.resolve(events);
  });
}
