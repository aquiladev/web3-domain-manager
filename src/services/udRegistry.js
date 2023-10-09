const BASE_URL = "https://api.unstoppabledomains.com";
// const BASE_URL = 'http://localhost:8080';

export const getAvailability = async (name) => {
  if (!name) {
    throw new Error(`Name is undefined [name: ${name}]`);
  }

  const url = `${BASE_URL}/registry/v1/domains/${name}`;
  return fetch(url).then((response) => response.json());
};

export const getPurchaseParams = async (name, owner) => {
  if (!name) {
    throw new Error(`Name is undefined [name: ${name}]`);
  }

  const url = `${BASE_URL}/registry/v1/domains/${name}/parameters/purchase`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner: { address: owner },
      records: {},
      currency: "MATIC",
    }),
  }).then((response) => response.json());
};
