FROM node:20-alpine AS base

WORKDIR /app

RUN npm install -g npm@latest

FROM base AS deps

COPY package.json ./

RUN npm install --production=false

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]

