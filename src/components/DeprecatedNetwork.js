import React from 'react';
import Alert from '@material-ui/lab/Alert';

export default function DeprecatedNetwork({chainId}) {
  return (
    <>
      {
        chainId === 4 ?
        <Alert
          variant='filled'
          severity='warning'
          style={{marginTop: 10}}
        >
          Rinkeby network support is deprecated, it will be disabled soon.
        </Alert> :
        ''
      }
    </>
  );
}
