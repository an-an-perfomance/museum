# Бэкенд MuzeumProject (Node.js Express, src/index.js)
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

# Папка для загрузок (в проде монтируется volume)
RUN mkdir -p src/uploads

EXPOSE 5000

CMD ["node", "src/index.js"]
