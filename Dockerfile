FROM node:20-alpine AS build-image
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g typescript
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=build-image /usr/src/app/build ./build
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "build/app.js" ]