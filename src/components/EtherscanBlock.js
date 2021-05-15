import React from 'react';
import Link from '@material-ui/core/Link';

import { ETHERSCAN_MAP } from './../utils/constants';

const EtherscanBlock = ({ blockNumber, chainId }) => {
  return (
    <Link
      href={`${ETHERSCAN_MAP[chainId]}block/${blockNumber}`}
      target='_blank'
      rel='noopener'>
      {blockNumber}
    </Link>
  );
}

export default EtherscanBlock;