import { gql } from "@apollo/client";

import { config } from "../utils/config";

export const getAccount = async (chainId, address, force = false) => {
  if (!chainId || !address) {
    throw new Error(
      `Invalid arguments [chainId: ${chainId}, account: ${address}]`
    );
  }

  const { client } = config[chainId];
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
      }
    `,
    variables: { id: String(address).toLowerCase() },
    fetchPolicy: force ? "no-cache" : undefined,
  });

  const { account } = data;
  if (!account) {
    return {};
  }

  const domains = _parseDomains(account.domains);

  // Domain name lookup in linked network
  const unknownTokens = domains.filter((d) => !d.name).map((d) => d.id);
  if (unknownTokens.length) {
    const map = await _getDomainNamesMap(
      config[chainId].linkedChainId,
      unknownTokens
    );
    console.log(
      "NO_NAME_DOMAINS",
      domains.filter((d) => !d.name).map((d) => d.id),
      map
    );
    domains.map((d) => {
      if (!d.name && !!map[d.id]) {
        d.name = map[d.id];
      }
      return d;
    });
  }

  return {
    id: account.id,
    domains,
  };
};

export const getDomain = async (chainId, tokenId, force = false) => {
  if (!chainId || !tokenId) {
    throw new Error(
      `Invalid arguments [chainId: ${chainId}, tokenId: ${tokenId}]`
    );
  }

  const { client } = config[chainId];
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

const _parseDomains = (domains) => {
  if (!domains || !Array(domains).length) {
    return [];
  }

  return Object.values(domains).map((d) => {
    return {
      id: d.id,
      name: d.name,
      owner: d.owner.id,
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

const _getDomainNamesMap = async (chainId, tokenIds) => {
  const { client } = config[chainId];
  if (!client) {
    throw new Error(`Unsupported chain ${chainId}`);
  }

  const { data } = await client.query({
    query: gql`
      query filteredDomains($ids: [ID!]!) {
        domains(where: { id_in: $ids }) {
          id
          name
        }
      }
    `,
    variables: {
      ids: tokenIds,
    },
  });
  const { domains } = data;
  if (!domains) {
    return {};
  }

  return Object.values(domains).reduce((obj, key) => {
    obj[key.id] = key.name;
    return obj;
  }, {});
};
