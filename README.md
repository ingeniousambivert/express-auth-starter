# Express-Starter

> Minimal Express Server with Authentication and User Management

## About

This project uses [Express](https://expressjs.com/). Fast, unopinionated, minimalist web framework for Node.js. 


### Different Variants : 


 **Plain Auth MongoDB** 

 This variant provides a REST API with JWT based local authentication with MongoDB.
 ```bash
    git clone https://github.com/ingeniousambivert/express-starter.git
    git checkout plain-auth-mongodb
  ```

 **MongoDB Auth Management**

 This variant provides a REST API with JWT based local authentication and basic auth management (verify-email, forgot-password, reset-password) with MongoDB.
 ```bash
    git clone https://github.com/ingeniousambivert/express-starter.git
    git checkout manage-auth-mongodb
  ```

 **PostgreSQL Auth Management**

 This variant provides a REST API with JWT based local authentication and basic auth management (verify-email, forgot-password, reset-password) with PostgreSQL.
 ```bash
    git clone https://github.com/ingeniousambivert/express-starter.git
    git checkout manage-auth-postgresql
  ```


## Todo

- [X]  Authentication Management 
- [ ]  Move to a Dependency Injection Approach - [Read More](https://softwareontheroad.com/ideal-nodejs-project-structure/#di)
- [ ]  Add test cases for all the features
- [ ]  Role Based Access Control
- [ ]  ? Add Scheduled Jobs for email sequences 
- [ ]  ? Add Events (Pub/Sub) for different sequences 



## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Terms and License

- Released under the [MIT](https://choosealicense.com/licenses/mit/) License.
