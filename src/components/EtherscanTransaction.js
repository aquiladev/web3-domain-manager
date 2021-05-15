import React from 'react';
import Link from '@material-ui/core/Link';

import { ETHERSCAN_MAP } from './../utils/constants';

const EtherscanTransaction = ({ transactionHash, chainId }) => {
  return (
    <Link
      href={`${ETHERSCAN_MAP[chainId]}tx/${transactionHash}`}
      target='_blank'
      rel='noopener'>
      {transactionHash.substr(0, 8)}...
    </Link>
  );
}

export default EtherscanTransaction;