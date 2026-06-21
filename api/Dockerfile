FROM node:lts-alpine3.23
WORKDIR /app
RUN npm install -g pm2
COPY . .
RUN npm install
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]