#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Uso: $0 /caminho/para/youtube-cookies.txt" >&2
  exit 2
fi

cookie_file="$1"
remote_host="${DEEFY_VPS_HOST:?Defina DEEFY_VPS_HOST com o host SSH da VPS.}"
remote_app_dir="${DEEFY_REMOTE_APP_DIR:?Defina DEEFY_REMOTE_APP_DIR com a pasta remota do projeto.}"
remote_dir="$remote_app_dir/secrets"
remote_file="$remote_dir/youtube-cookies.txt"

if [[ ! -f "$cookie_file" ]]; then
  echo "Arquivo nao encontrado: $cookie_file" >&2
  exit 1
fi

if ! grep -Eq "^(# Netscape HTTP Cookie File|[^#[:space:]]+[[:space:]]+TRUE|[^#[:space:]]+[[:space:]]+FALSE)" "$cookie_file"; then
  echo "Aviso: o arquivo nao parece estar no formato Netscape cookies.txt usado pelo yt-dlp." >&2
  echo "Continue apenas se ele foi exportado por uma extensao/ ferramenta compatível com cookies.txt." >&2
fi

ssh "$remote_host" "mkdir -p '$remote_dir' && chmod 700 '$remote_dir'"
scp "$cookie_file" "$remote_host:$remote_file"
ssh "$remote_host" "chmod 600 '$remote_file' && ls -l '$remote_file'"

echo
echo "Cookies enviados para: $remote_host:$remote_file"
echo "O container backend monta essa pasta automaticamente; nao precisa commitar nem reiniciar."
