import { ApolloClient, InMemoryCache } from "@apollo/client";

export const config = {
  1: {
    rpcUrl: "https://mainnet.infura.io/v3/3947c045ca5a4d68bff484fb038fb11c",
    linkedChainId: 137,
    client: new ApolloClient({
      uri: "https://api.thegraph.com/subgraphs/name/aquiladev/uns",
      cache: new InMemoryCache(),
    }),
  },
  5: {
    rpcUrl: "https://goerli.infura.io/v3/3947c045ca5a4d68bff484fb038fb11c",
    linkedChainId: 80001,
    client: new ApolloClient({
      uri: "https://api.thegraph.com/subgraphs/name/aquiladev/uns-goerli",
      cache: new InMemoryCache(),
    }),
  },
  137: {
    rpcUrl:
      "https://polygon-mainnet.infura.io/v3/3947c045ca5a4d68bff484fb038fb11c",
    linkedChainId: 1,
    client: new ApolloClient({
      uri: "https://api.thegraph.com/subgraphs/name/aquiladev/uns-polygon",
      cache: new InMemoryCache(),
    }),
  },
  80001: {
    rpcUrl:
      "https://polygon-mumbai.infura.io/v3/3947c045ca5a4d68bff484fb038fb11c",
    linkedChainId: 5,
    client: new ApolloClient({
      uri: "https://api.thegraph.com/subgraphs/name/aquiladev/uns-mumbai",
      cache: new InMemoryCache(),
    }),
  },
};
