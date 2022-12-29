import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { isError } from './utils';

const highWaterMarkFile = '.eslint-ratchet';

const pExec = promisify(exec);

const isErrorWithCode = (x: unknown): x is Error & { code: string } =>
  isError(x) && 'code' in x;

const parseCaughtError = (x: unknown) => isError(x) ? x : new Error(`${x}`);

const getHighWaterMark = async () => {
  try {
    const ratchetFileText = await readFile(highWaterMarkFile, 'utf8');

    const trimmedText = ratchetFileText.trim();

    const highWaterMark = Number.parseInt(trimmedText, 10);

    return Number.isNaN(highWaterMark)
      ? new Error(`${highWaterMarkFile} contained invalid integer: ${trimmedText}`)
      : highWaterMark;
  } catch (error) {
    return isErrorWithCode(error) && error.code === 'ENOENT'
      ? undefined
      : parseCaughtError(error);
  }
}

const writeHighWaterMark = async (highWaterMark: number) =>
  writeFile(highWaterMarkFile, `${highWaterMark}`, 'utf8')
    .then(() => undefined)
    .catch(parseCaughtError);

const writeErrorsLog = async (errors: string[]) => {
  const errorsLog = errors.join('\n');

  return writeFile(`${highWaterMarkFile}.log`, errorsLog, 'utf8')
    .then(() => undefined)
    .catch(parseCaughtError);
}

interface ExecError {
  code: number
  stdout: string
}

const isExecError = (x: unknown): x is Error & ExecError =>
  isError(x) && 'code' in x && 'stdout' in x;

const handleEslintError = (error: unknown) => {
  const cwd = process.cwd();

  if (isExecError(error)) {
    return error.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.match(/^\d+ problems?$/))
      .map((line) => line.replace(/:\d+:\d+: /, ': '))
      .map((line) => line.replace(`${cwd}/`, ''));
  }

  return parseCaughtError(error)
}

const getErrors = (): Promise<string[] | Error> =>
  pExec('eslint -f unix .')
    .then(() => [])
    .catch(handleEslintError);

export const ratchet = async () => {
  const highWaterMark = await getHighWaterMark();
  if (isError(highWaterMark)) return highWaterMark;

  const errors = await getErrors();
  if (isError(errors)) return errors;

  const writeLogResult = await writeErrorsLog(errors);
  if (isError(writeLogResult)) return writeLogResult;

  const errorsCount = errors.length;

  if (highWaterMark === undefined) {
    console.log(`New eslint-ratchet high water mark: ${errorsCount}`);
    return await writeHighWaterMark(errorsCount);
  }

  if (errorsCount > highWaterMark) {
    return new Error(
      `ESLint errors increased from ${highWaterMark} to ${errorsCount}.`
    );
  }

  if (errorsCount < highWaterMark && process.env['CI'] === 'true') {
    return new Error(
      `ESLint error count has decreased but ${highWaterMarkFile} not updated.`
    );
  }

  if (errorsCount < highWaterMark) {
    console.log(
      `ESLint errors decreased from ${highWaterMark} to ${errorsCount}.`
    );
    return await writeHighWaterMark(errorsCount);
  }

  return undefined;
};

export default ratchet;
