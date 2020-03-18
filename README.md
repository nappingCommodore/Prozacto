# Prozacto

Prozacto is a backend server written in express and mongodb.

## Installation

After cloning the project use the package manager **npm** to install required dependencies.

```bash
npm install
```

Start the server using following command.

```bash
npm run start
```

Server starts on port 3000.

## Usage
We are using **josnwebtoken** for authentication and deciding the roles. Models are created in mongodb using mongoose. Once you have registered the user or logged in, you will get token in **x-auth-token** in response header. You need to send this token in header as **x-access-token**. This token decides your role and accordingly enables and disables apis.

## License
[MIT](https://choosealicense.com/licenses/mit/)