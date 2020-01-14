FROM node:10-alpine

WORKDIR /app

COPY common ./
COPY css ./
COPY js ./
COPY libs ./
COPY prototyping ./
COPY resources ./
COPY app.js ./
COPY generate-world.js ./
COPY index.html ./
COPY package*.json ./
COPY yarn.lock ./

RUN yarn

CMD ["node", "app.js"]

