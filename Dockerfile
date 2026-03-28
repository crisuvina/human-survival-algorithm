# ============================================================
#  Dockerfile
#  Human Survival Algorithm — Container Definition
# ============================================================

FROM node:20-alpine

LABEL maintainer="Human Survival Algorithm Community"
LABEL description="An algorithm that optimizes for human flourishing"
LABEL license="AGPL-3.0"

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json ./
RUN npm install --production

# Copy source
COPY *.js ./
COPY database/ ./database/

# Non-root user for security
RUN addgroup -S hsa && adduser -S hsa -G hsa
USER hsa

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "api_server.js"]
