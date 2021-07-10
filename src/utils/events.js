import { DOMAIN_EVENTS } from './constants';

export async function fetchDomainEvents(library, contract, domainId) {
  return Promise.all(DOMAIN_EVENTS.map((event) => {
    return fetchEvents(
      contract,
      event,
      { tokenId: domainId },
      contract._config.deploymentBlock
    );
  })).then(x => x.flat().sort((a, b) => a.blockNumber - b.blockNumber));
}

export async function fetchTransferEvents(library, contract, account) {
  return fetchEvents(
    contract,
    'Transfer',
    { to: account },
    contract._config.deploymentBlock
  );
}

export async function fetchNewURIEvents(library, contract, tokenId) {
  return fetchEvents(
    contract,
    'NewURI',
    { tokenId },
    contract._config.deploymentBlock
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
