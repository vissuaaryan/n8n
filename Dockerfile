FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --quiet && \
    npm cache clean --force

# Reduce noise during build
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROME_PATH=/usr/src/app/node_modules/@sparticuz/chrome-linux/

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]
