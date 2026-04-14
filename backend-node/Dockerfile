FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
RUN addgroup -S fct && adduser -S fct -G fct
USER fct
EXPOSE 8080
CMD ["node", "src/index.js"]
