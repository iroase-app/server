import { Request, Response } from 'express';

/**
 * Check if the password is valid
 * @param username The username to check
 * @returns `true` if the password is valid, otherwise an error message as `string`.
 */
function user(username: string): string | true {
  if (!username.match(/^[A-Za-z0-9]*$/g)) return 'illegalCharacters';
  if (username.length > 24) return 'usernameTooLong';
  if (username.length < 3) return 'usernameTooShort';
  return true;
}

/**
 * Check if the password is valid
 * @param password The password to check
 * @returns `true` if the password is valid, otherwise an error message as `string`.
 */
function pass(password: string): string | true {
  if (password.length > 128) return 'passwordTooLong';
  if (password.length < 8) return 'passwordTooShort';
  return true;
}

/**
 * Express middleware to validate the username and password
 * @param req The request object
 * @param res The response object
 * @param next Callback to run next
 */
export default function validate(req: Request, res: Response, next: Function) {
  if (!(req.body.username && req.body.password)) res.status(400).send({ error: 'fieldMissing' });
  else {
    const u = user(req.body.username);
    const p = pass(req.body.password);

    if (u !== true) {
      res.status(400).send({ error: u });
    } else if (p !== true) {
      res.status(400).send({ error: p });
    } else { next(); }
  }
}
