FROM node:20-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS dev

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000
CMD ["yarn", "dev"]

FROM deps AS build

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN yarn prisma:generate
RUN yarn build

FROM base AS prod-deps

ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --ignore-scripts

FROM base AS prod

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
