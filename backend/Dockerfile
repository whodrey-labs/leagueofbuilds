FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN if [ -f package.json ]; then npm install --omit=dev; fi

COPY . .

EXPOSE 8080

CMD ["npm", "start"]