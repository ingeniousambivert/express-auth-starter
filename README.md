# Express-Auth

> Minimal Express Server with JWT Auth

## About

This project uses [Express](https://expressjs.com/). Fast, unopinionated, minimalist web framework for Node.js.

## Getting Started

Getting up and running is simple.

1. Make sure you have [NodeJS](https://nodejs.org/), [npm](https://www.npmjs.com/) and [MongoDB](https://www.mongodb.com/) installed in your system globally.
2. Install your dependencies.

```bash
cd path/to/server
npm install
```

3.1 Start your server.

```bash
npm start
```

3.2 Start your server in development mode.

```bash
DEBUG=express-auth-starter:* npm run dev
```

4. Configuring the server with environment variables

   - Create a `.env` file in the root
   - Add the following lines to it (modify according to your environment/requirements)

   ```env
   # Express Server config
   PORT=8000

   # MongoDB config
   MONGO_URI=mongodb://127.0.0.1:27017/express-auth-starter

   # JWT config
    # Do not use the sample string below, to get a hex string run: openssl rand -hex 32
   JWT_SECRET=4cc0c74e26c5f9500356350d05b39c79b79655bb1a6df7bbe69f6f5b2fb0f04e
   ```

## Routes

- **GET** `/users/:id`

_request_ :

```js
{
  Authorization: "Bearer XXX";
}
```

_reponse_ :

```js
{
  "_id",
  "firstname",
  "lastname",
  "email",
}
```

- **GET** `/generator/banks` : returns an array of strings with bank names.

- **POST** `/generator/countries` : Takes in the following type of body parameters(not case-sensitive)

  ```js
  {
    "bank":"HONG KONG AND SHANGHAI BANKING CORP., LTD."
  }
  ```

  returns an array of strings with country names.

- **POST** `/generator/generate` : Takes in the following type of body parameters(not case-sensitive)

  ```js
  {
    "bank":"CITIBANK",
    "country":"India",
    "brand":"MasterCard",
    "quantity":10
  }
  ```

  returns a single card object or an array of objects.

- **POST** `/generator/verify` : Takes in the following type of body parameters

  ```js
  {
    "number":2511058888886260
  }
  ```

  returns a string message with VALID or NOT VALID keywords and a boolean.

## Built with

[ExpressJS](https://expressjs.com)

[NodeJS](https://nodejs.org)

[MongoDB](https://www.mongodb.com/)

## Help

For more information on all the things you can do with Express visit - [Getting Started guide on Express](https://expressjs.com/en/starter/installing.html).
