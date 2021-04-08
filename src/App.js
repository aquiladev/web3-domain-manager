import React from 'react';

import DefaultApp from './DefaultApp';
import GnosisSafeApp from './GnosisSafeApp';

export default function() {
  return (
    process.env.REACT_APP_SAPP_TARGET ? <GnosisSafeApp/> : <DefaultApp/>
  );
}
