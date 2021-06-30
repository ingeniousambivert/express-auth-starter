# Express-Starter

> Minimal Express Server with Authentication and User Management

## About

This project uses [Express](https://expressjs.com/). Fast, unopinionated, minimalist web framework for Node.js. It provides a REST API with JWT based authentication and basic user management (verify-email, forgot-password).

For starter with plain JWT based authentication use branch [`plain-auth`](https://github.com/ingeniousambivert/express-auth-starter/tree/plain-auth)

## Getting Started

Getting up and running is simple.

1. Make sure you have [NodeJS](https://nodejs.org/), [npm](https://www.npmjs.com/), [Redis](https://redis.io/) and [MongoDB](https://www.mongodb.com/) installed in your system globally.
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
   MONGO_URI=mongodb://127.0.0.1:27017/express-server

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

   By default the *mailer* works with the [SMTP Transport](https://www.npmjs.com/package/nodemailer-smtp-transport) configured with Gmail. But you can use any supported [transports](https://nodemailer.com/transports/).

## Routes

All routes start with a prefix of - `/api/`

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
    "firstname":"Monarch",
    "lastname":"Maisuriya",
    "email":"monarch@maisuriya.com",
    "createdAt": "2021-04-23T14:01:21.654Z",
    "updatedAt": "2021-04-23T14:01:21.654Z",
    "__v": 0
}
```

**POST** `/users/auth/signup`

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
{ message: "Created User and sent verification email to monarch@maisuriya.com" }

```

**POST** `/users/auth/signin`

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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZWxsZXItYmxvZyIsInN1YiI6IjYwY2M4MDNmZmY3YzFkMDE1MTEwYTc5YyIsImlzc2F0IjoxNjI0MDE5MDU1OTkxLCJpYXQiOjE2MjQwMTkwNTUsImV4cCI6MTYyNDEwNTQ1NX0.Mb1xxlBnonPvIL8Il7Q7gzwU0sq9S_LdCwOP6TUrfnw",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZWxsZXItYmxvZyIsInN1YiI6IjYwY2M4MDNmZmY3YzFkMDE1MTEwYTc5YyIsImlzc2F0IjoxNjI0MDE5MDU1OTk5LCJpYXQiOjE2MjQwMTkwNTUsImV4cCI6MTY1NTU3NjY1NX0.Tbquwy6dp8inhDge_2gcLj5RS3yHO4ynvgU5SfjhBoI",
    "id": "60cc803fff7c1d015110a79c"
}
```

**POST** `/users/auth/refresh`

_request_ :

```js
{
   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZWxsZXItYmxvZyIsInN1YiI6IjYwYzc4ODkxZjIzN2MxM2UzNjU2ZjQxMCIsImlzc2F0IjoxNjIzOTM2NjIzNzk3LCJpYXQiOjE2MjM5MzY2MjMsImV4cCI6MTY1NTQ5NDIyM30.IbPXShVlsqJNnfAdt2ekrCFhintNQu6mefROpwYNkwQ"
}
```

_reponse_ :

```js
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZWxsZXItYmxvZyIsInN1YiI6IjYwY2M4MDNmZmY3YzFkMDE1MTEwYTc5YyIsImlzc2F0IjoxNjI0MDE5MDU1OTkxLCJpYXQiOjE2MjQwMTkwNTUsImV4cCI6MTYyNDEwNTQ1NX0.Mb1xxlBnonPvIL8Il7Q7gzwU0sq9S_LdCwOP6TUrfnw",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZWxsZXItYmxvZyIsInN1YiI6IjYwY2M4MDNmZmY3YzFkMDE1MTEwYTc5YyIsImlzc2F0IjoxNjI0MDE5MDU1OTk5LCJpYXQiOjE2MjQwMTkwNTUsImV4cCI6MTY1NTU3NjY1NX0.Tbquwy6dp8inhDge_2gcLj5RS3yHO4ynvgU5SfjhBoI",
    "id": "60cc803fff7c1d015110a79c"
}
```

**DELETE** `/users/auth/signout`

_request_ :

```js
{
   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZWxsZXItYmxvZyIsInN1YiI6IjYwYzc4ODkxZjIzN2MxM2UzNjU2ZjQxMCIsImlzc2F0IjoxNjIzOTM2NjIzNzk3LCJpYXQiOjE2MjM5MzY2MjMsImV4cCI6MTY1NTQ5NDIyM30.IbPXShVlsqJNnfAdt2ekrCFhintNQu6mefROpwYNkwQ"
}
```

_reponse_ :

```js
Status : 204
```

**POST** `/users/account/:type`

**Type :** _**verify-user**_

_request_ :

```js
{
    "userId":"60cc803fff7c1d015110a79c",
    "token":"9a054da59c7d6c05b23f6860c3736335de853527640b8ada9929d53391dd271b"
}
```

_reponse_ :

```js
{ message: "User has been succesfully verified" }

```

**Type :** _**resend-verify**_

_request_ :

```js
{
    "userId":"60cc803fff7c1d015110a79c",
}
```

_reponse_ :

```js
{ message: "Resent verification email to monarch@maisuriya.com" }

```

**Type :** _**forgot-password**_

_request_ :

```js
{
    "email":"monarchm@maisuriya.com",
}
```

_reponse_ :

```js
{ message: "Sent a reset password link to  monarch@maisuriya.com" }

```

**Type :** _**reset-password**_

_request_ :

```js
{
    "userId":"60cc803fff7c1d015110a79c",
    "token":"1cf3e3109f8d87f290d6c1a97b09e0cafad606c3864eea8b44d69c5b295198f7",
    "password":"test"
}
```

_reponse_ :

```js
{ message: "Password Reset Successfully" }

```

**PATCH** `/users/update/data/:id`

_request_ :

```js
//Pass the user id in query params
{
  Authorization: "Bearer XXX";
}

body: {
  "firstname":"Testing First Name",
}
```

_reponse_ :

```js
{
    "_id": "6082d3318b2a795b31c07965",
    "firstname":"Testing First Name",
    "lastname":"Maisuriya",
    "email":"maisuriya@monarch.com",
    "password": "$2b$10$lW3lQ6SBhyM2g7BtPRw0suYLt7ohtMYI9Nr3MyxdnQ/Q/mGB/s61O",
    "createdAt": "2021-04-23T14:01:21.654Z",
    "updatedAt": "2021-04-23T14:01:21.654Z",
    "__v": 0
}
```

**PATCH** `/users/update/password/:id`

_request_ :

```js
//Pass the user id in query params
{
  Authorization: "Bearer XXX";
}

body: {
  "password":"newAndUpdatedPassword",
}
```

_reponse_ :

```js
{ message: "Successfully updated password" }
```

**PATCH** `/users/update/email/:id`

_request_ :

```js
//Pass the user id in query params
{
  Authorization: "Bearer XXX";
}

body: {
  "email":"monarch@maisuriya.com",
}
```

_reponse_ :

```js
{
  "Sent verification email to monarch@maisuriya.com",
  {
    "_id": "6082d3318b2a795b31c07965",
    "firstname":"Testing First Name",
    "lastname":"Maisuriya",
    "email":"monarch@maisuriya.com",
    "password": "$2b$10$lW3lQ6SBhyM2g7BtPRw0suYLt7ohtMYI9Nr3MyxdnQ/Q/mGB/s61O",
    "createdAt": "2021-04-23T14:01:21.654Z",
    "updatedAt": "2021-04-23T14:01:21.654Z",
    "__v": 0
}
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

```js
  { message: "Successfully deleted user"}
```

## Built with

[ExpressJS](https://expressjs.com)

[NodeJS](https://nodejs.org)

[MongoDB](https://www.mongodb.com/)

## Help

For more information on all the things you can do with Express visit - [Getting Started guide on Express](https://expressjs.com/en/starter/installing.html).

```

```
