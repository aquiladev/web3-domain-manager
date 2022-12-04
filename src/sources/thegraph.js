import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

export const THE_GRAPH_CLIENTS = {
  1: new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/aquiladev/uns",
    cache: new InMemoryCache(),
  }),
  5: new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/aquiladev/uns-goerli",
    cache: new InMemoryCache(),
  }),
  137: new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/aquiladev/uns-polygon",
    cache: new InMemoryCache(),
  }),
  80001: new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/aquiladev/uns-mumbai",
    cache: new InMemoryCache(),
  }),
};

export const getAccount = async (chainId, address, force = false) => {
  if (!chainId || !address) {
    throw new Error(
      `Invalid arguments [chainId: ${chainId}, account: ${address}]`
    );
  }

  const client = THE_GRAPH_CLIENTS[chainId];
  if (!client) {
    throw new Error(`Unsupported chain ${chainId}`);
  }

  const { data } = await client.query({
    query: gql`
      query GetAccount($id: ID!) {
        account(id: $id) {
          id
          reverse {
            id
            name
          }
          domains {
            id
            name
            registry
            resolver {
              address
              records {
                key
                value
              }
            }
          }
        }
      }
    `,
    variables: { id: String(address).toLowerCase() },
    fetchPolicy: force ? "no-cache" : undefined,
  });

  const { account } = data;
  if (!account) {
    return {};
  }

  return {
    id: account.id,
    domains: _parseDomains(account.id, account.domains),
  };
};

export const getDomain = async (chainId, tokenId, force = false) => {
  if (!chainId || !tokenId) {
    throw new Error(
      `Invalid arguments [chainId: ${chainId}, tokenId: ${tokenId}]`
    );
  }

  const client = THE_GRAPH_CLIENTS[chainId];
  if (!client) {
    throw new Error(`Unsupported chain ${chainId}`);
  }

  const { data } = await client.query({
    query: gql`
      query GetDomain($id: ID!) {
        domain(id: $id) {
          id
          name
          registry
          owner {
            id
          }
          resolver {
            address
            records {
              key
              value
            }
          }
        }
      }
    `,
    variables: { id: String(tokenId).toLowerCase() },
    fetchPolicy: force ? "no-cache" : undefined,
  });

  const { domain } = data;
  if (!domain) {
    return {};
  }

  return {
    id: domain.id,
    name: domain.name,
    owner: domain.owner.id,
    registry: domain.registry,
    resolver: (domain.resolver || {}).address,
    records: _parseRecords(domain.resolver),
  };
};

const _parseDomains = (account, domains) => {
  if (!domains || !Array(domains).length) {
    return [];
  }

  return Object.values(domains).map((d) => {
    return {
      id: d.id,
      name: d.name,
      owner: account,
      registry: d.registry,
      resolver: (d.resolver || {}).address,
      records: _parseRecords(d.resolver),
    };
  });
};

const _parseRecords = (resolver) => {
  if (!resolver || !resolver.records) {
    return {};
  }

  return Object.values(resolver.records).reduce((obj, r) => {
    obj[r.key] = r.value;
    return obj;
  }, {});
};
