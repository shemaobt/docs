FROM node:20-alpine AS builder

WORKDIR /app/site
COPY site/package*.json ./
RUN npm ci

WORKDIR /app
COPY site ./site
COPY rfcs ./rfcs
COPY assets ./assets

WORKDIR /app/site
RUN DOCS_BASE_URL=/ DOCS_SITE_URL=https://docs.example.com RFCS_DOCS_PATH=../rfcs npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/site/build /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
