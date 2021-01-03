# Transformice Web Client

Transformice Web Client is a web app that allows user to login to their Transformice account and chat

This website is built with:
- [Quasar](https://quasar.dev/)
- [Transformice.js](https://www.npmjs.com/package/transformice.js)
- [Socket.IO](https://socket.io/)

## Setup

### Web:

1. Install dependencies
```
cd vue
npm i
```
2. Setup environment variable
   1. Create `.env.dev` and `.env.prod` file on root of `vue` folder
   2. Put `SOCKET` variable on each of the env file with the value of socket.io URL for development and production environment respectively (check `.env.dev.example` / `.env.prod.example`)

### Server:
1. Install dependencies
```
cd server
npm i
```
2. Create `.env` file on the root of `server` folder, refers to `.env.example`
3. Create `users.json` file on `server/src` folder containing the list of whitelisted username (in lowercase) that can login (refers to `users.example.json`)

## Development

For the web, run:
```
cd vue
quasar dev
```
to start the web development server, by default it will run on port 8080 (http://localhost:8080)

For the server, run:
```
cd server
npm run dev
```
to start the development server.

Both of the development server will watch for file changes and recompile accordingly.

## Build / Production

For the web, run:
```
cd vue
quasar build
```
to build the minified web, the compiled web will be located in `vue/dist/spa` 

For the server, run:
```
cd server
npm run build
```
to compile the TypeScript code, the compiled JavaScript code will be located in `server/dist`, to start the server, run:
```
npm run start
```
