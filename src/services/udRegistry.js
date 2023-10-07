export const getAvailability = async (name) => {
  if (!name) {
    throw new Error(`Name is undefined [name: ${name}]`);
  }

  const url = `https://api.unstoppabledomains.com/registry/v1/domains/${name}`;
  return fetch(url).then((response) => response.json());
};

export const getPurchaseParams = async (name) => {
  if (!name) {
    throw new Error(`Name is undefined [name: ${name}]`);
  }

  const url = `https://api.unstoppabledomains.com/registry/v1/domains/${name}/parameters/purchase`;
  return fetch(url).then((response) => response.json());
};
