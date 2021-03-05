import { keccak_256 as sha3 } from 'js-sha3';

export default function hamehash(domain) {
  domain = domain ? domain.trim().toLowerCase() : '';
  ensureSupportedDomain(domain);

  const parent =
    '0000000000000000000000000000000000000000000000000000000000000000';
  return '0x' + [parent]
    .concat(
      domain
        .split('.')
        .reverse()
        .filter(label => label),
    )
    .reduce((parent, label) =>
      childhash(parent, label),
    );
}

function ensureSupportedDomain(domain) {
  if (!isSupportedDomain(domain)) {
    throw new Error('Domain is not supported', {
      domain,
    });
  }
}

function isSupportedDomain(domain) {
  return (
    domain === 'crypto' ||
    (domain.indexOf('.') > 0 &&
      /^.{1,}\.(crypto)$/.test(domain) &&
      domain.split('.').every(v => !!v.length))
  );
}

function childhash(parent, label) {
  parent = parent.replace(/^0x/, '');
  const childHash = sha3(label);
  // eslint-disable-next-line no-undef
  return sha3(Buffer.from(parent + childHash, 'hex'));
}