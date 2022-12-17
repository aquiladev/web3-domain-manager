import supportedKeys from "uns/resolver-keys.json";

const _keys = Object.keys(supportedKeys.keys);

export async function getDomainName(registry, tokenId) {
  const events = await registry.source.fetchNewURIEvents(tokenId);
  if (!events || !events.length) return tokenId;

  return events[0].args.uri;
}

export const fetchTokens = (registry, account, type) => {
  return registry.source.fetchTransferEvents(account).then(async (events) => {
    console.debug(`Loaded events from registry ${registry.address}`, events);

    const _tokens = [];
    const _distinct = [];
    events.forEach(async (e) => {
      if (!_distinct.includes(e.args.tokenId.toString())) {
        _tokens.push({
          tokenId: e.args.tokenId.toHexString(),
          registry: registry.address,
          type,
        });
        _distinct.push(e.args.tokenId.toString());
      }
    });
    return _tokens;
  });
};

export const fetchNames = async (source, tokens) => {
  if (!tokens.length) return [];

  const events = await source.fetchNewURIEvents(tokens);
  return tokens.map((t) => {
    const event = events.find((e) => e.args.tokenId.toHexString() === t);
    return {
      tokenId: t,
      name: !!event ? event.args.uri : t,
    };
  });
};

export const fetchDomain = async (
  domain,
  registry,
  proxyReader,
  account,
  names
) => {
  const _data = await proxyReader.callStatic.getData(_keys, domain.id);

  const records = {};
  _keys.forEach((k, i) => (records[k] = _data[2][i]));

  const name = names && names.find((n) => n.tokenId === domain.id);
  domain.name = name ? name.name : await getDomainName(registry, domain.id);
  domain.owner = _data.owner;
  domain.removed = _data.owner !== account;
  domain.resolver = _data.resolver;
  domain.records = records;
  domain.loading = false;

  return domain;
};

export const fetchDomains = async (cnsRegistry, unsRegistry) => {
  const domains = [];

  console.debug("Loading events...");
  const [cnsTokens, unsTokens] = await Promise.all([
    fetchTokens(cnsRegistry, "cns"),
    fetchTokens(unsRegistry, "uns"),
  ]);

  const names = await Promise.all([
    fetchNames(
      cnsRegistry.source,
      cnsTokens.map((t) => t.tokenId)
    ),
    fetchNames(
      unsRegistry.source,
      unsTokens.map((t) => t.tokenId)
    ),
  ]).then((x) => x.flat());

  for (const token of cnsTokens.concat(unsTokens)) {
    // const registry =
    //   unsRegistry.address === token.registry ? unsRegistry : cnsRegistry;

    const domain = {
      id: token.tokenId,
      name: token.tokenId,
      registry: token.registry,
      type: token.type,
      loading: true,
    };
    domains.push(domain);

    // fetchDomain(domain, registry, names).then((dd) => {
    //   domains.map((d) => {
    //     return d.id === dd.id ? { ...d, ...dd } : d;
    //   });

    //   setData({
    //     ...data,
    //     [stateKey]: {
    //       isFetched: true,
    //       domains: domains.filter((d) => !d.removed),
    //     },
    //   });
    // });
  }

  return domains.filter((d) => !d.removed);
};
