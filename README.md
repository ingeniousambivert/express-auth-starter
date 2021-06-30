# Express-Starter

> Minimal Express Server with Authentication and User Management

## About

This project uses [Express](https://expressjs.com/). Fast, unopinionated, minimalist web framework for Node.js. 

For starter with plain JWT based authentication use branch [`plain-auth`](https://github.com/ingeniousambivert/express-auth-starter/tree/plain-auth)


#### Different Variants : 


 **Plain Auth** 

 This variant provides a REST API with JWT based local authentication with **MongoDB**.
 ```bash
    git clone https://github.com/ingeniousambivert/express-starter.git
    git checkout plain-auth
  ```

 **MongoDB Auth Management**

 This variant provides a REST API with JWT based local authentication and basic auth management (verify-email, forgot-password, reset-password) with MongoDB.
 ```bash
    git clone https://github.com/ingeniousambivert/express-starter.git
    git checkout auth-mongodb
  ```

 **PostgreSQL Auth Management**

 This variant provides a REST API with JWT based local authentication and basic auth management (verify-email, forgot-password, reset-password) with PostgreSQL.
 ```bash
    git clone https://github.com/ingeniousambivert/express-starter.git
    git checkout auth-postgresql
  ```