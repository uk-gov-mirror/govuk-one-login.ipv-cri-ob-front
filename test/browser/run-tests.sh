#!/usr/bin/env bash

# this script runs in the smoke tests container

set -euo pipefail

STACK_NAME="${SAM_STACK_NAME:-local}}"
AWS_REGION="${AWS_REGION:-eu-west-2}"

echo "STACK_NAME: ${STACK_NAME}"
echo "AWS_REGION: ${AWS_REGION}"

get_stack_output() {
  local stack="$1" key="$2" value
  value=$(aws cloudformation describe-stacks \
    --stack-name "$stack" \
    --region "$AWS_REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue" \
    --output text) || { echo "ERROR: Failed to fetch '${key}' output from '${stack}' stack"; exit 1; }
  [[ -n "${value}" && "${value}" != "None" ]] || { echo "ERROR: Output '${key}' is missing or empty in stack '${stack}'" >&2; exit 1; }
  printf '%s' "${value}"
}

APP_URL=$(get_stack_output "${STACK_NAME}" "APP_URL")
CORE_STUB_URL=$(get_stack_output "test-resources" "TestHarnessExecuteUrl")

export APP_URL
export CORE_STUB_URL

cd /app/test/browser
npx playwright test --config playwright.smoke.config.ts
