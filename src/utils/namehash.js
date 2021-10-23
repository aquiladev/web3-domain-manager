import { ethers, BigNumber } from 'ethers';

export default function hamehash(domain) {
  domain = domain ? domain.trim().toLowerCase() : '';
  try {
    return BigNumber.from(domain).toHexString();
  } catch {}

  ensureSupportedTLD(domain);
  return ethers.utils.namehash.hash(domain)
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
