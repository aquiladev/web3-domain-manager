import { CNS_DOMAIN_EVENTS, UNS_DOMAIN_EVENTS } from './constants';

export async function fetchDomainEvents(contract, domain) {
  const events = domain.type.toLowerCase() === 'uns'
    ? UNS_DOMAIN_EVENTS
    : CNS_DOMAIN_EVENTS;
  return Promise.all(events.map((event) => {
    return fetchEvents(
      contract,
      event,
      { tokenId: domain.id },
      contract._config.deploymentBlock
    );
  })).then(x => x.flat().sort((a, b) => a.blockNumber - b.blockNumber));
}

export async function fetchTransferEvents(contract, account) {
  return fetchEvents(
    contract,
    'Transfer',
    { to: account },
    contract._config.deploymentBlock
  );
}

export async function fetchNewURIEvents(contract, tokenId) {
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
