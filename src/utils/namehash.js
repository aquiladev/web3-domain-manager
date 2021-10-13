import { BigNumber } from "@ethersproject/bignumber";
const namehash = require('@ensdomains/eth-ens-namehash');

export default function hamehash(domain) {
  domain = domain ? domain.trim().toLowerCase() : '';
  try {
    return BigNumber.from(domain).toHexString();
  } catch {}

  ensureSupportedTLD(domain);
  return namehash.hash(domain)
}

function ensureSupportedTLD(domain) {
  if (!isSupportedTLD(domain)) {
    throw new Error('Domain is not supported', {
      domain,
    });
  }
}

function isSupportedTLD(domain) {
  return (
    ['crypto','coin','wallet','bitcoin','x','888','nft','dao','blockchain'].includes(domain) ||
    (domain.indexOf('.') > 0 &&
      /^.{1,}\.(crypto|coin|wallet|bitcoin|x|888|nft|dao|blockchain)$/.test(domain) &&
      domain.split('.').every(v => !!v.length))
  );
}
