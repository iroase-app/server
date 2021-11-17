/* eslint-disable no-unused-vars */
declare namespace Express {
  interface Request {

    /**
     * Attach the user to a request if a session is provided
    */
      user?: {
          /**
           * The user's id, from the database.
           * @type {string}
           * @memberof User
           */
          id: string;
          /**
           * User's username
           * @type {string}
           * @memberof User
          */
          username: string;
          /**
           * If the user is a moderator
           * @type {boolean}
           * @memberof User
           * @default false
          */
          isModerator: boolean;
      }
  }
}
