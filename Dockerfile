FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --quiet && \
    npm cache clean --force

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]
