const create_blocks = {
  1: 9082251,
  4: 7484092,
};

const events = [
  'Approval',
  'NewURI',
  'NewURIPrefix',
  'Resolve',
  'Sync',
  'Transfer'
];

export async function fetchDomainEvents(library, contract, domainId) {
  const chainId = await library.eth.getChainId();
  return Promise.all(events.map((event) => {
    return fetchEvents(
      contract,
      event,
      { tokenId: domainId },
      create_blocks[chainId]
    );
  })).then(x => x.flat().sort((a, b) => a.blockNumber - b.blockNumber));
}

export async function fetchTransferEvents(library, contract, account) {
  const chainId = await library.eth.getChainId();
  return fetchEvents(
    contract,
    'Transfer',
    { to: account },
    create_blocks[chainId]
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
