FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install without freezing the dead brain of Railway server
RUN npm install --omit=dev --quiet && \
 npm cache clean --force --silent

COPY . .

EXPOSE $PORT

CMD ["node", "server.js"]
