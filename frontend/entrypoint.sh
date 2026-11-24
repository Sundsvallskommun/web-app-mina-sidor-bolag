#!/bin/sh
# Replaces the build-time placeholders from .env-cicd with the container's runtime environment.
# Only NEXT_PUBLIC_* values need this; server-only variables such as HEALTH_* and INTERNAL_API_URL
# are read from process.env at runtime.
#
# An unset variable is replaced with an empty string, so optional values (alert banner, Matomo)
# are simply off instead of showing the placeholder text.
set -eu

# The placeholders sit inside JS string literals, so the value is escaped for JS (\ and ") and then
# for the sed replacement (\, & and the | delimiter).
escape_value() {
  printf '%s' "$1" | sed -e 's/[\\"]/\\&/g' -e 's/[\\&|]/\\&/g'
}

replace_env_var() {
  name=$1
  value=$(printenv "$name" || true)

  if [ -z "$value" ]; then
    echo "Warning: ${name} is not set, using an empty value"
  else
    echo "Replacing ${name}..."
  fi

  escaped=$(escape_value "$value")
  find /app/.next -type f -name "*.js" -exec sed -i "s|${name}_PLACEHOLDER|${escaped}|g" {} +
}

echo "Running as user: $(id)"
echo "Replacing runtime environment variables..."

# Keep in sync with .env-cicd.
for name in \
  NEXT_PUBLIC_API_URL \
  NEXT_PUBLIC_APP_NAME \
  NEXT_PUBLIC_DELEGATE_CHANNEL \
  NEXT_PUBLIC_INACTIVITY_WARNING_TIMEOUT \
  NEXT_PUBLIC_INACTIVITY_COUNTDOWN_TIMEOUT \
  NEXT_PUBLIC_FEATURE_AI_ASSISTANT \
  NEXT_PUBLIC_FEATURE_DISTURBANCES \
  NEXT_PUBLIC_ALERT_BANNER_MESSAGE \
  NEXT_PUBLIC_ALERT_BANNER_SEVERITY \
  NEXT_PUBLIC_MATOMO_URL \
  NEXT_PUBLIC_MATOMO_SITE_ID; do
  replace_env_var "$name"
done

echo "Starting Next.js..."
exec node server.js
