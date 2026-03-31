FROM node:22-bookworm-slim AS build

WORKDIR /app

# Keep UTF-8 locale and minimize mojibake risks in build output.
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Update OS packages to patched versions.
RUN apt-get update \
  && apt-get upgrade -y --no-install-recommends \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM cgr.dev/chainguard/nginx:latest

USER root

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["-c", "/etc/nginx/nginx.conf", "-e", "/dev/stderr", "-g", "daemon off;"]
