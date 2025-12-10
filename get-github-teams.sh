#!/bin/bash

# Script to list GitHub organization teams and their details
# Usage: ./get-github-teams.sh YOUR_GITHUB_TOKEN TruKraft

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "❌ Please provide GitHub token and organization name"
  echo "Usage: ./get-github-teams.sh YOUR_GITHUB_TOKEN ORGANIZATION_NAME"
  echo ""
  echo "Example:"
  echo "  ./get-github-teams.sh ghp_xxx... TruKraft"
  exit 1
fi

TOKEN=$1
ORG=$2

echo "🔍 Fetching teams for organization: $ORG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fetch teams from GitHub API
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/orgs/$ORG/teams")

# Check if response contains error
if echo "$RESPONSE" | grep -q '"message"'; then
  ERROR_MSG=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
  echo "❌ Error fetching teams: $ERROR_MSG"
  exit 1
fi

# Count teams
TEAM_COUNT=$(echo "$RESPONSE" | grep -o '"name":' | wc -l | xargs)

if [ "$TEAM_COUNT" -eq 0 ]; then
  echo "⚠️  No teams found in organization: $ORG"
  echo ""
  echo "💡 To create teams:"
  echo "   1. Go to https://github.com/orgs/$ORG/teams"
  echo "   2. Click 'New team'"
  echo "   3. Create teams like 'developers', 'designers', etc."
  exit 0
fi

echo "📋 Found $TEAM_COUNT team(s) in $ORG:"
echo ""

# Parse and display team information
echo "$RESPONSE" | grep -E '"(name|slug|description|privacy)"' | while read -r line; do
  if echo "$line" | grep -q '"name"'; then
    NAME=$(echo "$line" | sed 's/.*"name": "\([^"]*\)".*/\1/')
    echo "────────────────────────────────────────"
    echo "📦 Team: $NAME"
  elif echo "$line" | grep -q '"slug"'; then
    SLUG=$(echo "$line" | sed 's/.*"slug": "\([^"]*\)".*/\1/')
    echo "   Slug: $SLUG"
  elif echo "$line" | grep -q '"description"'; then
    DESC=$(echo "$line" | sed 's/.*"description": "\([^"]*\)".*/\1/')
    if [ "$DESC" != "null" ] && [ -n "$DESC" ]; then
      echo "   Description: $DESC"
    fi
  elif echo "$line" | grep -q '"privacy"'; then
    PRIVACY=$(echo "$line" | sed 's/.*"privacy": "\([^"]*\)".*/\1/')
    echo "   Privacy: $PRIVACY"
  fi
done

echo "────────────────────────────────────────"
echo ""
echo "✨ To auto-add repos to teams, add this to your .env.local:"
echo ""

# Build example team list
TEAM_SLUGS=$(echo "$RESPONSE" | grep -o '"slug":"[^"]*"' | cut -d'"' -f4 | head -5 | tr '\n' ',' | sed 's/,$//')

echo "GITHUB_ORG=$ORG"
echo "GITHUB_TEAMS=$TEAM_SLUGS"
echo "GITHUB_TEAM_PERMISSION=push"
echo ""
echo "📖 Permission options:"
echo "   - pull   : Can read and clone"
echo "   - push   : Can read, clone, and push (recommended)"
echo "   - admin  : Full access including settings"
echo "   - maintain: Can manage without access to destructive actions"
echo "   - triage : Can manage issues and pull requests"
echo ""

