#!/usr/bin/env node
import ratchet from '.';
import { isError } from './utils';

(async () => {
  const result = await ratchet();

  if (isError(result)) {
    console.error(result.message);
    process.exitCode = 1;
  }
})();
