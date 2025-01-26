# Audio Recording/Filtering 

## Tech Stack

This app uses a number of open-source projects to work properly:

- [React] - Frontend web development
- [Gradle] - Java Build tool
- [Spring] - Application Framework
- [JUnit] - Unit testing library
- [Java] - Backend development
- [PostgreSQL] - SQL Database
- [Docker] - Containerization platform
- [Google Cloud Platform] - Cloud computing platform

And of course, this app is accessible with a [public repository][dill]
 on GitHub.

## Installation

This application requires [React] v19, [Java] v23, [PostgreSQL] v14.14, [Gradle] v8.12, [Docker] v27.1, and [Node.js] v23.6 to run.

### To run this project locally:

Rename the application.properties.example file in ./server/src/main/resources to application.properties and replace the placeholder values to your environment variables. You must replace these values for the app to compile and run.

```sh
spring.application.name=research_web_app
spring.datasource.url={postgres_db_connection_url}
spring.datasource.username={postgres_db_username}
spring.datasource.password={postgres_db_password}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
PROJECTID={GCP_project_id}
BUCKETNAME={GCP_project_bucket_name}
```


Install the dependencies and devDependencies and start the server on port :8080.

```sh
cd research_web_app
cd server
./gradlew build
./gradlew bootRun
```

Install the dependencies and devDependencies and start the client on port :3000.
```sh
cd research_web_app
cd client
npm install
npm start
```

### Troubleshooting

#### **Client Issues**

#### 1. **Error**: `sh: react-scripts: command not found`
   - **Cause**: The `react-scripts` package is not installed because `npm install` was not run before `npm start`.
   - **Solution**:
     - Navigate to the `client` directory:
       ```sh
       cd research_web_app/client
       ```
     - Install dependencies:
       ```sh
       npm install
       ```
     - Start the client:
       ```sh
       npm start
       ```


#### **Server Issues**

#### 1. **Error**: `IllegalState Failed to load ApplicationContext`
   - **Cause**: The `.env` file is missing in the `backend` folder directory.
   - **Solution**:
     - Navigate to the `backend` directory:
       ```sh
       cd research_web_app/server
       ```
     - Modify the `application.properties` file and add the required environment variables. Example:
       ```env
        spring.application.name=research_web_app
        spring.datasource.url={postgres_db_connection_url}
        spring.datasource.username={postgres_db_username}
        spring.datasource.password={postgres_db_password}
        spring.datasource.driver-class-name=org.postgresql.Driver
        spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
       ```
     - Restart the server:
       ```sh
       ./gradlew clean install
       ./gradlew bootRun
       ```
#### **2. Error**: `Database connection failed`
- **Cause**: The database credentials in the `application.properties` file are incorrect or the PostgreSQL server is not running.
- **Solution**:
  - Check the `application.properties` file in the `server` directory and ensure the credentials match your database setup. Example:
    ```env
    spring.application.name=research_web_app
    spring.datasource.url={postgres_db_connection_url}
    spring.datasource.username={postgres_db_username}
    spring.datasource.password={postgres_db_password}
    spring.datasource.driver-class-name=org.postgresql.Driver
    spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
    ```
  - Ensure the PostgreSQL server is running:
    ```sh
    sudo service postgresql start
    ```



[//]: #
   [dill]: <https://github.com/samuelchoi0522/research-web-app>
   [git-repo-url]: <https://github.com/samuelchoi0522/research-web-app.git>
   [React]: <https://react.dev/>
   [Gradle]: <https://gradle.org/>
   [Spring]: <https://spring.io/>
   [JUnit]: <https://junit.org/junit5/>
   [Java]: <https://www.java.com/en/>
   [PostgreSQL]: <https://www.postgresql.org/>
   [Docker]: <https://www.docker.com/>
   [Google Cloud Platform]: <https://cloud.google.com/?hl=en>
   [Node.js]: <https://nodejs.org/en>
