import React from 'react';
import Link from '@material-ui/core/Link';

import { ZERO_ADDRESS, ETHERSCAN_MAP } from './../utils/constants';

const EtherscanAddress = ({ address, chainId, label }) => {
  return (
    <>
      {
        address === ZERO_ADDRESS ?
          address :
          <Link
            href={`${ETHERSCAN_MAP[chainId]}address/${address}`}
            target='_blank'
            rel='noopener'>
            {label || address}
          </Link>
      }
    </>
  );
}

export default EtherscanAddress;