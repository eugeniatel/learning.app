#!/bin/bash
# One-way sync: curriculum app notes -> Obsidian vault.
# The git repo is the source of truth. This mirrors concept notes and
# reflections into the vault so they show up in the Obsidian graph.
# Additive only: it never deletes files in the vault.
set -euo pipefail

REPO_NOTES="/Users/euge/Desktop/projects/curriculum-app/notes"
VAULT_DIR="/Users/euge/Library/Mobile Documents/iCloud~md~obsidian/Documents/geminis/Curriculum"

if [ ! -d "$REPO_NOTES" ]; then
  echo "$(date '+%Y-%m-%d %H:%M') skipped: notes folder not found at $REPO_NOTES"
  exit 0
fi

mkdir -p "$VAULT_DIR"
rsync -a --include='*/' --include='*.md' --exclude='*' "$REPO_NOTES/" "$VAULT_DIR/"
echo "$(date '+%Y-%m-%d %H:%M') synced notes -> $VAULT_DIR"
