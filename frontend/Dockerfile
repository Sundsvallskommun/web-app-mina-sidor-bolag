# Frontend
# =====================
# Dependencies
# =====================
# Red Hat UBI image: runs as UID 1001 in group 0, which is what OpenShift's restricted SCC expects.
FROM registry.access.redhat.com/ubi9/nodejs-22 AS deps

USER root
RUN mkdir -p /app && chown 1001:0 /app
USER 1001
WORKDIR /app

COPY --chown=1001:0 package.json yarn.lock ./

# Yarn is pinned and lifecycle scripts are disabled: nothing in this project needs an install
# script (sharp ships prebuilt binaries), and it stops dependencies from running arbitrary code
# or phoning home during the image build.
RUN npm install -g --ignore-scripts yarn@1.22.22 \
 && yarn install --frozen-lockfile --ignore-scripts --network-timeout 600000

# =====================
# Build
# =====================
FROM registry.access.redhat.com/ubi9/nodejs-22 AS builder

USER root
RUN mkdir -p /app && chown 1001:0 /app
USER 1001
WORKDIR /app

COPY --from=deps --chown=1001:0 /app/node_modules ./node_modules
COPY --chown=1001:0 . .

# Build with placeholder values for the NEXT_PUBLIC_* variables. Next inlines these at build time,
# so entrypoint.sh replaces the placeholders with real values when the container starts.
COPY --chown=1001:0 .env-cicd .env.local

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install -g --ignore-scripts yarn@1.22.22 \
 && yarn build

# =====================
# Runtime
# =====================
FROM registry.access.redhat.com/ubi9/nodejs-22 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Kubernetes sets HOSTNAME to the pod name; the standalone server binds to HOSTNAME if set.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Static, never written at runtime: left root-owned and read-only for the app user.
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Next standalone output (includes its own pruned node_modules and server.js).
# These must be writable by group 0: entrypoint.sh rewrites the inlined NEXT_PUBLIC_* placeholders
# in .next at container start, and the image optimizer writes to .next/cache. OpenShift runs the
# container as an arbitrary UID in group 0, so group write is the only way to allow that.
COPY --from=builder --chown=1001:0 /app/.next/standalone ./
COPY --from=builder --chown=1001:0 /app/.next/static ./.next/static
USER root
RUN chmod -R g+w /app/.next
USER 1001

# Root-owned and read-only; line endings are enforced by .gitattributes.
COPY --chmod=0555 entrypoint.sh ./

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
