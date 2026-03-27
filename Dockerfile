FROM node:22-bookworm-slim AS build

WORKDIR /app

# Keep UTF-8 locale and minimize mojibake risks in build output.
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Update OS packages and npm to patched versions.
RUN apt-get update \
  && apt-get upgrade -y --no-install-recommends \
  && apt-get install -y --no-install-recommends ca-certificates \
  && npm install -g npm@11.12.0 \
  && npm cache clean --force \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:stable-bookworm

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Update base OS packages to include latest security patches.
RUN apt-get update \
  && apt-get upgrade -y --no-install-recommends \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
