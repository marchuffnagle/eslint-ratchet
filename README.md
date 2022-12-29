# eslint-ratchet

Adding [ESLint](https://eslint.org/) to a project, or modifying ESLint rules, can result a huge number of reported errors. Often, it will be more than you're willing or able to fix at once. That's where eslint-ratchet comes in. Instead of fixing everything at once, eslint-ratchet helps ensure that things get better over time.

When you first run eslint-ratchet , it counts the number of errors reported by `eslint` and records that as the "high water mark".

If the number of reported errors increases, then eslint-ratchet will fail and report how many new errors have been discovered.

When the number of reported errors _decreases_, eslint-ratchet records that as the new high water mark, and that lower number is now your upper limit. As time goes on, that limit should approach zero.

If you find this utility useful, you may also be interested in [tsc-ratchet](https://www.npmjs.com/package/tsc-ratchet).

## Install

```sh
npm install --save-dev eslint-ratchet
```

## Usage

These instructions assume that you already have ESLint configured for your project.

Run eslint-ratchet with:

```sh
$ npx eslint-ratchet
New eslint-ratchet high water mark: 123
```

The first time you run, the number of reported errors will be written to a `.eslint-ratchet` file. Another file called `.eslint-ratchet.log` will be created that contains the list of errors reported by `eslint`. These two files should be added to your git repository.

Once you've fixed some errors, run again.

```sh
$ npx eslint-ratchet
ESLint errors decreased from 123 to 101.
```

At this point, 101 is your new high water mark.

If you introduce new errors, then eslint-ratchet will fail and report the increase.

```sh
$ npx eslint-ratchet
ESLint errors increased from 101 to 105.
>> 1
```

The `.eslint-ratchet.log` file is helpful for determining where you've introduced new errors. Using git diff, you can get an idea of where the new errors are. (Note that the errors stored in the log file don't contain line numbers. Because code changes often result in line number changes, including the line numbers of the errors makes the diff much harder to read.)

When you're happy with the changes you've made, make sure to include `.eslint-ratchet` and `.eslint-ratchet.log` in your commit.

## CI mode

When the `CI` environment variable is set to `"true"`, eslint-ratchet will require that the number of reported errors _exactly_ match the value stored in `.eslint-ratchet`. If fewer errors are reported, that's an indication that you probably reduced the number of errors but forgot to commit your updated `.eslint-ratchet` file.

## Credits

The idea for eslint-ratchet came from the excellent [quality](https://rubygems.org/gems/quality) Ruby gem.
