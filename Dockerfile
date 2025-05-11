# syntax = docker/dockerfile:1.7-labs

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ARG YARN_VERSION=1.22.22
RUN npm install -g yarn@$YARN_VERSION --force


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn \
    yarn install --frozen-lockfile --production=false

COPY --parents src public next.config.ts postcss.config.mjs eslint.config.mjs tsconfig.json /app/

# Build application
RUN --mount=type=secret,id=deploy \
    --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn \
    cp /run/secrets/deploy .env.production \
    && yarn build

# Remove development dependencies
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn \
    yarn install --production=true


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

COPY scripts /app/scripts

# Entrypoint sets up the container.
ENTRYPOINT [ "/app/scripts/start.sh" ]

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "yarn", "start" ]
