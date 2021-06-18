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
npm run dev
```

4. Configuring the server with environment variables

   - Create a `.env` file in the root
   - Add the following lines to it (modify according to your environment/requirements)

   ```env
   # Express Server config
   PORT=8000

   # MongoDB config
   MONGO_URI=mongodb://127.0.0.1:27017/teller-blog-server

   # JWT config
    # Do not use the sample string below, to get a hex string run: openssl rand -hex 32
    ACCESS_TOKEN_SECRET=b970aded3f8731894204ea5cc127756b197925591281a2c7538660b99791b984
    REFRESH_TOKEN_SECRET=f820f7853587aa1f1f75f4040750199825cc1cc7cf4a26bc95212423c76224ef

   # Node Mailer config
      GMAIL_USERNAME=yourusername
      GMAIL_PASSWORD=yourpassword

   # Client URL - For mails 
    CLIENT_URL=http://127.0.0.1:3000
   ```

## Routes

**GET** `/users/:id`

_request_ :

```js
//Pass the user id in query params
{
  Authorization: "Bearer XXX";
}
```

_reponse_ :

```js
{
    "_id": "6082d3318b2a795b31c07965",
    "firstname": "test",
    "lastname": "test",
    "email": "test@test.com",
    "createdAt": "2021-04-23T14:01:21.654Z",
    "updatedAt": "2021-04-23T14:01:21.654Z",
    "__v": 0
}
```

**POST** `/users/signup`

_request_ :

```js
{
    "firstname":"Monarch",
    "lastname":"Maisuriya",
    "email":"monarch@maisuriya.com",
    "password":"maisuriya"
}
```

_reponse_ :

```js
{
    "_id": "6082d3318b2a795b31c07965",
    "firstname":"Monarch",
    "lastname":"Maisuriya",
    "email":"monarch@maisuriya.com",
    "password": "$2b$10$lW3lQ6SBhyM2g7BtPRw0suYLt7ohtMYI9Nr3MyxdnQ/Q/mGB/s61O",
    "createdAt": "2021-04-23T14:01:21.654Z",
    "updatedAt": "2021-04-23T14:01:21.654Z",
    "__v": 0
}
```

**POST** `/users/signin`

_request_ :

```js
{
    "email":"monarch@maisuriya.com",
    "password":"maisuriya"
}
```

_reponse_ :

```js
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJleHByZXNzLWF1dGgiLCJzdWIiOiI2MDgyZDMzMThiMmE3OTViMzFjMDc5NjUiLCJpc3NhdCI6MTYxOTE4NjYwODExOCwiaWF0IjoxNjE5MTg2NjA4LCJleHAiOjE2MTkyNzMwMDh9.G4QpGOww7tRIyIUB38j07uR0p8ucvzww-R8SvVEowQs",
    "_id": "6082d3318b2a795b31c07965"
}
```

**PATCH** `/users/update/:id`

_request_ :

```js
//Pass the user id in query params
{
  Authorization: "Bearer XXX";
}

body: {
  "email":"maisuriya@monarch.com",
}
```

_reponse_ :

```js
{
    "_id": "6082d3318b2a795b31c07965",
    "firstname":"Monarch",
    "lastname":"Maisuriya",
    "email":"maisuriya@monarch.com",
    "password": "$2b$10$lW3lQ6SBhyM2g7BtPRw0suYLt7ohtMYI9Nr3MyxdnQ/Q/mGB/s61O",
    "createdAt": "2021-04-23T14:01:21.654Z",
    "updatedAt": "2021-04-23T14:01:21.654Z",
    "__v": 0
}
```

**DELETE** `/users/delete/:id`

_request_ :

```js
//Pass the user id in query params
{
  Authorization: "Bearer XXX";
}
```

_reponse_ :

```bash
"Deleted User"
```

## Built with

[ExpressJS](https://expressjs.com)

[NodeJS](https://nodejs.org)

[MongoDB](https://www.mongodb.com/)

## Help

For more information on all the things you can do with Express visit - [Getting Started guide on Express](https://expressjs.com/en/starter/installing.html).

```

```
