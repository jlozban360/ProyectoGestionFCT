FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
RUN addgroup -S fct && adduser -S fct -G fct
USER fct
EXPOSE 8080
CMD ["node", "src/index.js"]
