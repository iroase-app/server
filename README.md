iroase server
---

> ⚠️ Please do not submit PRs for the time being. They will be rejected until at least September 2023.
> 
> ⚠️ Please open an issue instead and ask me to take a look at it.

[![Test](https://github.com/iroase-app/server/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/iroase-app/server/actions/workflows/test.yml)

## Developing

> ⚠️ Please do not submit PRs for the time being. They will be rejected until at least September 2023.

We use PostgreSQL for our database. The app tries to connect as the user `iroase`, so make sure this user exists in the database.

`yarn install` to install dependencies, and then `yarn dev`. The server will reload when edits are made.

`yarn test` to run the test suite. Docker needs to be installed to run the test suite. Or push and let CI deal with it, it'll run there. 🤷

## Running and deploying

```git clone https://github.com/iroase-app/server/```

```yarn install```

```yarn prod```

This will start up the docker containers needed.
