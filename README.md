# eslint-ratchet

## Overview

When you first introduce [eslint](https://eslint.org/) on a project, the number of reported problems can be overwhelming. Fixing all of them at once is often not realistic. `eslint-ratchet` aims to help you make incremental improvement toward zero eslint problems.

`eslint-ratchet` keeps track of how many eslint problems are being reported. This is the "high water mark", the number of reported problems that can't be exceeded. When you call `npm run lint:eslint`, it compares the current number of problems reported with the high water mark.

- If the number of problems have increased, it returns a failure status.
- If the number of problems has stayed the same, it returns a success status.
- If the number of problems has decreased, it stores that new number as the new high water mark and reports success. It essentially "ratchets down" the number of permitted problems.
- If running in CI mode (`CI` environment variable is "true"), and the number of reported problems is less than the high water mark, it returns a failure status. If this is the case, the high water mark value needs to be updated and committed to git.

## Usage

- Copy [bin/eslint-ratchet.sh](bin/eslint-ratchet.sh) into your project's `bin/` directory
- Add the `lint`, `lint:eslint`, and `lint:eslint:ci` scripts from [package.json](package.json) into your project's `package.json` file
- Update your CI scripts to run `npm run lint:eslint:ci`
- After making chagnes and before committing, execute `npm run lint:eslint`. If you have reduced the number of linter problems, the [.eslint-ratchet](.eslint-ratchet) file will have been updated with the new high water mark. Include that `.eslint-ratchet` file in your commit.

## Credits

This project is inspired by the [quality](https://rubygems.org/gems/quality) Ruby gem.
