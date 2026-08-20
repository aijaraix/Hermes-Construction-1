#!/usr/bin/env bash
# HERMES Construction — One-Line Git Commit & Push Helper Script

set -e

echo "=== HERMES Construction GitHub Sync ==="
echo "Repository: https://github.com/aijaraix/Hermes-Construction"

git add .
COMMIT_MSG="feat(hermes): autonomous construction system update $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
git commit -m "$COMMIT_MSG" || echo "No changes to commit."

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Pushing using GITHUB_TOKEN..."
  git push https://${GITHUB_TOKEN}@github.com/aijaraix/Hermes-Construction.git main
else
  echo "Pushing to origin main..."
  git push origin main || echo "Note: Configure GITHUB_TOKEN or SSH key to push directly."
fi

echo "=== Sync Complete ==="
