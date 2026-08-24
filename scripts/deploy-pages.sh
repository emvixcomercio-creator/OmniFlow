#!/usr/bin/env bash
# Publica o build no GitHub Pages (branch gh-pages), sem dependências extras.
#   npm run deploy
set -e

BRANCH=gh-pages
WORKTREE=.deploy

command -v git >/dev/null || { echo "git não encontrado"; exit 1; }
git remote get-url origin >/dev/null 2>&1 || { echo "Sem remote 'origin'. Crie o repositório primeiro."; exit 1; }

echo "› Gerando o build…"
npm run build

echo "› Preparando a branch $BRANCH…"
rm -rf "$WORKTREE"
git worktree prune
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  git fetch origin "$BRANCH"
  git worktree add -B "$BRANCH" "$WORKTREE" "origin/$BRANCH"
else
  git worktree add -B "$BRANCH" "$WORKTREE"
fi

find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -r dist/* "$WORKTREE"/
touch "$WORKTREE/.nojekyll"          # evita o Jekyll ignorar arquivos do build

cd "$WORKTREE"
git add -A
if git diff --cached --quiet; then
  echo "› Nada mudou desde a última publicação."
else
  git commit -q -m "deploy: $(git -C .. log --oneline -1 --format=%h)"
  git push -q -f origin "$BRANCH"
  echo "› Publicado."
fi

cd ..
git worktree remove "$WORKTREE" --force
echo "› Pronto. O Pages atualiza em cerca de um minuto."
