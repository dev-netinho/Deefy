#!/usr/bin/env python3
"""Importa uma playlist do YouTube para o Deefy via Supabase sem alterar schema."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


FEAT_PATTERN = re.compile(
    r"(?:\(|\[|\s)(?:feat\.?|ft\.?|part\.?|participa(?:ç|c)[aã]o|with)\s+([^)\]\-]+)",
    re.IGNORECASE,
)
CONNECTOR_PATTERN = re.compile(r"\s(?:x|&|,)\s", re.IGNORECASE)
YOUTUBE_BLOCK_PATTERNS = (
    "HTTP Error 429",
    "Too Many Requests",
    "Sign in to confirm",
    "not a bot",
)


class YoutubeAccessBlockedError(RuntimeError):
    """Erro fatal quando o YouTube bloqueia a VPS, nao apenas uma faixa."""


@dataclass
class Config:
    supabase_url: str
    service_key: str
    music_bucket: str
    image_bucket: str
    owner_user_id: int | None
    owner_user_email: str
    public_playlist: bool
    dry_run: bool
    yt_dlp_bin: str
    yt_dlp_options: list[str]
    workdir: Path


class SupabaseClient:
    def __init__(self, config: Config):
        self.config = config
        self.base_url = config.supabase_url.rstrip("/")
        self.rest_url = f"{self.base_url}/rest/v1"
        self.storage_url = f"{self.base_url}/storage/v1/object"

    def _request(
        self,
        method: str,
        url: str,
        *,
        body: bytes | None = None,
        headers: dict[str, str] | None = None,
        expected: tuple[int, ...] = (200, 201, 204),
    ) -> tuple[int, bytes]:
        request_headers = {
            "apikey": self.config.service_key,
            "Authorization": f"Bearer {self.config.service_key}",
            **(headers or {}),
        }
        request = urllib.request.Request(url, data=body, method=method, headers=request_headers)
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                payload = response.read()
                if response.status not in expected:
                    raise RuntimeError(f"{method} {url} retornou {response.status}: {payload[:500]!r}")
                return response.status, payload
        except urllib.error.HTTPError as exc:
            payload = exc.read()
            if exc.code in expected:
                return exc.code, payload
            raise RuntimeError(f"{method} {url} retornou {exc.code}: {payload[:800].decode(errors='ignore')}")

    def select(self, table: str, params: dict[str, str]) -> list[dict[str, Any]]:
        if self.config.dry_run:
            print(f"[dry-run] SELECT {table}: {json.dumps(params, ensure_ascii=False)}")
            return []

        query = urllib.parse.urlencode(params, safe="*,.()")
        _, payload = self._request("GET", f"{self.rest_url}/{table}?{query}")
        return json.loads(payload.decode() or "[]")

    def insert(self, table: str, row: dict[str, Any]) -> dict[str, Any]:
        if self.config.dry_run:
            print(f"[dry-run] INSERT {table}: {json.dumps(row, ensure_ascii=False)}")
            return {"id": -1, **row}

        body = json.dumps(row, ensure_ascii=False).encode()
        headers = {"Content-Type": "application/json", "Prefer": "return=representation"}
        _, payload = self._request("POST", f"{self.rest_url}/{table}", body=body, headers=headers, expected=(200, 201))
        data = json.loads(payload.decode() or "[]")
        if not data:
            raise RuntimeError(f"Insert em {table} nao retornou registro.")
        return data[0]

    def table_exists(self, table: str) -> bool:
        try:
            self.select(table, {"select": "id", "limit": "1"})
            return True
        except RuntimeError as exc:
            return "404" not in str(exc) and "PGRST205" not in str(exc)

    def ensure_public_bucket(self, bucket: str) -> None:
        if self.config.dry_run:
            print(f"[dry-run] ENSURE BUCKET publico: {bucket}")
            return

        try:
            self._request("GET", f"{self.base_url}/storage/v1/bucket/{urllib.parse.quote(bucket)}")
            return
        except RuntimeError as exc:
            if "404" not in str(exc):
                raise

        body = json.dumps({"id": bucket, "name": bucket, "public": True}).encode()
        self._request(
            "POST",
            f"{self.base_url}/storage/v1/bucket",
            body=body,
            headers={"Content-Type": "application/json"},
            expected=(200, 201),
        )
        print(f"[storage] bucket criado: {bucket}")

    def upload_file(self, bucket: str, object_path: str, file_path: Path, content_type: str | None = None) -> str:
        public_url = f"{self.base_url}/storage/v1/object/public/{bucket}/{urllib.parse.quote(object_path)}"
        if self.config.dry_run:
            print(f"[dry-run] UPLOAD {file_path} -> {bucket}/{object_path}")
            return public_url

        headers = {
            "Content-Type": content_type or mimetypes.guess_type(file_path.name)[0] or "application/octet-stream",
            "x-upsert": "true",
        }
        self._request(
            "PUT",
            f"{self.storage_url}/{bucket}/{urllib.parse.quote(object_path)}",
            body=file_path.read_bytes(),
            headers=headers,
            expected=(200, 201),
        )
        return public_url


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("'\""))


def run_json(command: list[str]) -> dict[str, Any]:
    try:
        completed = subprocess.run(command, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        details = (exc.stderr or exc.stdout or "").strip()
        raise RuntimeError(f"{' '.join(command)} falhou com codigo {exc.returncode}: {details}") from exc
    return json.loads(completed.stdout)


def yt_dlp_command(config: Config, args: list[str]) -> list[str]:
    return [config.yt_dlp_bin, *config.yt_dlp_options, *args]


def slugify(value: str, fallback: str = "item") -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value or fallback


def best_thumbnail(metadata: dict[str, Any]) -> str | None:
    thumbnails = metadata.get("thumbnails") or []
    if thumbnails:
        selected = sorted(thumbnails, key=lambda item: item.get("width") or 0)[-1]
        return selected.get("url")
    return metadata.get("thumbnail")


def download_url(url: str, target: Path) -> Path:
    target.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        suffix = mimetypes.guess_extension(response.headers.get_content_type()) or ".jpg"
        final_target = target.with_suffix(suffix)
        final_target.write_bytes(response.read())
        return final_target


def try_download_image(url: str, target: Path, label: str) -> Path | None:
    try:
        return download_url(url, target)
    except Exception as exc:
        print(f"[aviso] capa ignorada ({label}): {exc}", file=sys.stderr)
        return None


def normalize_artist_name(value: str | None) -> str:
    if not value:
        return "Artista desconhecido"
    value = re.sub(r"\s+", " ", value).strip()
    return value[:100] if len(value) > 100 else value


def comparison_key(value: str | None) -> str:
    value = normalize_artist_name(value)
    value = unicodedata.normalize("NFD", value)
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
    value = re.sub(r"[^a-zA-Z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip().casefold()


def find_by_normalized_name(
    supabase: SupabaseClient,
    table: str,
    name_column: str,
    value: str,
    *,
    extra_params: dict[str, str] | None = None,
) -> dict[str, Any] | None:
    params = {"select": "*", "limit": "1000", **(extra_params or {})}
    expected = comparison_key(value)
    for row in supabase.select(table, params):
        if comparison_key(row.get(name_column)) == expected:
            return row
    return None


def extract_feat_names(title: str, primary_artist: str) -> list[str]:
    candidates: list[str] = []
    for match in FEAT_PATTERN.finditer(title):
        candidates.extend(CONNECTOR_PATTERN.split(match.group(1)))

    if " - " in title:
        left_side = title.split(" - ", 1)[0]
        if primary_artist.lower() in left_side.lower() and CONNECTOR_PATTERN.search(left_side):
            candidates.extend(CONNECTOR_PATTERN.split(left_side))

    cleaned: list[str] = []
    for candidate in candidates:
        candidate = re.sub(r"[\[\]()]|oficial|official|video|clipe", "", candidate, flags=re.IGNORECASE)
        candidate = normalize_artist_name(candidate)
        if candidate and candidate.lower() != primary_artist.lower() and candidate not in cleaned:
            cleaned.append(candidate)
    return cleaned


def find_or_create_artist(
    supabase: SupabaseClient,
    name: str,
    *,
    bio: str | None = None,
    photo_url: str | None = None,
) -> dict[str, Any]:
    name = normalize_artist_name(name)
    normalized = find_by_normalized_name(supabase, "artista", "nome", name)
    if normalized:
        print(f"[artista] reutilizado: {normalized.get('nome')} id={normalized.get('id')}")
        return normalized

    found = supabase.select("artista", {"select": "*", "nome": f"eq.{name}", "limit": "1"})
    if found:
        return found[0]
    created = supabase.insert("artista", {"nome": name, "bio": bio, "fotourl": photo_url})
    print(f"[artista] criado: {name}")
    return created


def resolve_owner_user_id(supabase: SupabaseClient, config: Config) -> int:
    if config.owner_user_id:
        return int(config.owner_user_id)
    if config.dry_run:
        print(f"[dry-run] OWNER usuario: {config.owner_user_email} id=-1")
        return -1

    found = supabase.select(
        "usuario",
        {"select": "id,email,nome", "email": f"eq.{config.owner_user_email}", "limit": "1"},
    )
    if found:
        owner = found[0]
        print(f"[owner] usando usuario por e-mail: {owner.get('email')} id={owner.get('id')}")
        return int(owner["id"])

    fallback = supabase.select("usuario", {"select": "id,email,nome", "limit": "1"})
    if fallback:
        owner = fallback[0]
        print(f"[owner] e-mail padrao nao encontrado; usando primeiro usuario: {owner.get('email')} id={owner.get('id')}")
        return int(owner["id"])

    raise RuntimeError("Nenhum usuario encontrado para ser dono da playlist. Crie um usuario antes da importacao.")


def find_or_create_playlist(
    supabase: SupabaseClient,
    *,
    title: str,
    owner_user_id: int,
    public_playlist: bool,
) -> dict[str, Any]:
    title = title[:100]
    normalized = find_by_normalized_name(
        supabase,
        "playlist",
        "nome",
        title,
        extra_params={"usuario_id": f"eq.{owner_user_id}"},
    )
    if normalized:
        print(f"[playlist] reutilizada: {normalized.get('nome')} id={normalized.get('id')}")
        return normalized

    found = supabase.select(
        "playlist",
        {"select": "*", "nome": f"eq.{title}", "usuario_id": f"eq.{owner_user_id}", "limit": "1"},
    )
    if found:
        return found[0]
    created = supabase.insert(
        "playlist",
        {
            "nome": title,
            "usuario_id": owner_user_id,
            "publica": public_playlist,
            "datacriacao": datetime.now(timezone.utc).isoformat(),
        },
    )
    print(f"[playlist] criada: {title}")
    return created


def find_existing_music(
    supabase: SupabaseClient,
    *,
    title: str,
    artist_id: int,
) -> dict[str, Any] | None:
    title = title[:100]
    normalized = find_by_normalized_name(
        supabase,
        "musica",
        "titulo",
        title,
        extra_params={"artista_id": f"eq.{artist_id}"},
    )
    if normalized:
        return normalized

    found = supabase.select(
        "musica",
        {"select": "*", "titulo": f"eq.{title}", "artista_id": f"eq.{artist_id}", "limit": "1"},
    )
    return found[0] if found else None


def find_or_create_music(
    supabase: SupabaseClient,
    *,
    title: str,
    genre: str,
    duration: int,
    artist_id: int,
    file_url: str,
    cover_url: str | None,
) -> dict[str, Any]:
    title = title[:100]
    existing = find_existing_music(supabase, title=title, artist_id=artist_id)
    if existing:
        print(f"[musica] reutilizada: {existing.get('titulo')} id={existing.get('id')}")
        return existing

    created = supabase.insert(
        "musica",
        {
            "titulo": title,
            "genero": genre[:100],
            "duracao": max(0, int(duration or 0)),
            "artista_id": artist_id,
            "arquivourl": file_url,
            "capaurl": cover_url,
        },
    )
    print(f"[musica] criada: {title}")
    return created


def link_detected_feat_artists(
    supabase: SupabaseClient,
    *,
    music_id: int,
    title: str,
    primary_artist_name: str,
) -> None:
    for feat_order, feat_name in enumerate(extract_feat_names(title, primary_artist_name), start=1):
        feat_artist = find_or_create_artist(supabase, feat_name, bio=f"Artista convidado detectado em: {title}")
        link_feat_artist(supabase, music_id, int(feat_artist["id"]), feat_order)


def link_playlist_music(supabase: SupabaseClient, playlist_id: int, music_id: int, order: int) -> None:
    found = supabase.select(
        "playlist_musica",
        {"select": "playlist_id,musica_id", "playlist_id": f"eq.{playlist_id}", "musica_id": f"eq.{music_id}", "limit": "1"},
    )
    if found:
        return
    supabase.insert("playlist_musica", {"playlist_id": playlist_id, "musica_id": music_id, "ordem": order})
    print(f"[playlist_musica] playlist={playlist_id} musica={music_id} ordem={order}")


def link_feat_artist(supabase: SupabaseClient, music_id: int, artist_id: int, order: int) -> None:
    if not supabase.table_exists("musica_artista"):
        print("[aviso] tabela musica_artista nao existe; feat detectado, mas nao vinculado no banco.")
        return
    found = supabase.select(
        "musica_artista",
        {"select": "id", "musica_id": f"eq.{music_id}", "artista_id": f"eq.{artist_id}", "limit": "1"},
    )
    if found:
        return
    supabase.insert(
        "musica_artista",
        {
            "musica_id": music_id,
            "artista_id": artist_id,
            "tipo_participacao": "FEAT",
            "ordem": order,
            "datacriacao": datetime.now(timezone.utc).isoformat(),
        },
    )
    print(f"[musica_artista] musica={music_id} artista={artist_id} ordem={order}")


def download_audio(config: Config, video_url: str, target_dir: Path) -> Path:
    output_template = str(target_dir / "%(id)s.%(ext)s")
    command = yt_dlp_command(
        config,
        [
            "--no-playlist",
            "-x",
            "--audio-format",
            "mp3",
            "--audio-quality",
            "0",
            "-o",
            output_template,
            video_url,
        ],
    )
    completed = subprocess.run(command, capture_output=True, text=True)
    combined_output = "\n".join(part for part in [completed.stdout, completed.stderr] if part)
    if combined_output:
        print(combined_output.rstrip())
    if completed.returncode != 0:
        if any(pattern in combined_output for pattern in YOUTUBE_BLOCK_PATTERNS):
            raise YoutubeAccessBlockedError(
                "YouTube bloqueou a VPS com anti-bot/429. "
                "Monte cookies validos no arquivo configurado por YTDLP_COOKIES_FILE "
                "ou em /app/secrets/youtube-cookies.txt "
                "ou aguarde o limite do IP expirar antes de tentar novamente."
            )
        raise RuntimeError(f"yt-dlp falhou com codigo {completed.returncode} ao baixar {video_url}.")
    mp3_files = sorted(target_dir.glob("*.mp3"), key=lambda path: path.stat().st_mtime, reverse=True)
    if not mp3_files:
        raise RuntimeError(f"yt-dlp nao gerou MP3 para {video_url}. Verifique se ffmpeg esta instalado.")
    return mp3_files[0]


def build_video_url(entry: dict[str, Any]) -> str:
    if entry.get("webpage_url"):
        return entry["webpage_url"]
    video_id = entry.get("id") or entry.get("url")
    if not video_id:
        raise RuntimeError(f"Entrada sem id/url: {entry}")
    if str(video_id).startswith("http"):
        return str(video_id)
    return f"https://www.youtube.com/watch?v={video_id}"


def import_playlist(args: argparse.Namespace, config: Config) -> None:
    supabase = SupabaseClient(config)
    config.workdir.mkdir(parents=True, exist_ok=True)

    if config.yt_dlp_options:
        print(f"[yt-dlp] opcoes extras ativas: {' '.join(config.yt_dlp_options)}")
    else:
        print("[yt-dlp] sem cookies/runtime JS extra; o YouTube pode bloquear a VPS com anti-bot/429.")

    playlist_meta = run_json(yt_dlp_command(config, ["-J", "--flat-playlist", args.playlist_url]))
    entries = playlist_meta.get("entries") or []
    if args.limit:
        entries = entries[: args.limit]
    if not entries:
        raise RuntimeError("Nenhum video encontrado na playlist.")

    playlist_title = args.playlist_title or playlist_meta.get("title") or "Playlist importada"
    primary_artist_name = args.artist_name or playlist_meta.get("uploader") or playlist_meta.get("channel") or "Canal importado"

    playlist_cover_url = None
    playlist_thumbnail = best_thumbnail(playlist_meta)
    existing_primary_artist = find_by_normalized_name(supabase, "artista", "nome", primary_artist_name)
    primary_artist_id: int | None = int(existing_primary_artist["id"]) if existing_primary_artist else None
    playlist_id: int | None = None

    def ensure_import_base() -> tuple[int, int]:
        nonlocal playlist_cover_url, primary_artist_id, playlist_id
        if primary_artist_id is not None and playlist_id is not None:
            return primary_artist_id, playlist_id

        supabase.ensure_public_bucket(config.music_bucket)
        supabase.ensure_public_bucket(config.image_bucket)
        owner_user_id = resolve_owner_user_id(supabase, config)

        if playlist_thumbnail and playlist_cover_url is None:
            cover_object_path = f"youtube/{slugify(primary_artist_name)}/{slugify(playlist_title)}/cover.jpg"
            image_file = Path("dry-run-playlist-cover.jpg")
            if not config.dry_run:
                downloaded_cover = try_download_image(
                    playlist_thumbnail,
                    config.workdir / "playlist-cover",
                    "playlist",
                )
                if downloaded_cover:
                    image_file = downloaded_cover
                    cover_object_path = f"youtube/{slugify(primary_artist_name)}/{slugify(playlist_title)}/cover{image_file.suffix}"
                else:
                    playlist_cover_url = ""
                    image_file = None
            if image_file:
                playlist_cover_url = supabase.upload_file(
                    config.image_bucket,
                    cover_object_path,
                    image_file,
                    "image/jpeg" if config.dry_run else None,
                )

        artist_photo_url = args.artist_photo_url or playlist_cover_url
        artist_bio = args.artist_bio or playlist_meta.get("description") or f"Canal importado do YouTube: {primary_artist_name}"
        if primary_artist_id is None:
            primary_artist = find_or_create_artist(supabase, primary_artist_name, bio=artist_bio, photo_url=artist_photo_url)
            primary_artist_id = int(primary_artist["id"])
        else:
            print(f"[artista] reutilizado: {primary_artist_name} id={primary_artist_id}")

        playlist = find_or_create_playlist(
            supabase,
            title=playlist_title,
            owner_user_id=owner_user_id,
            public_playlist=config.public_playlist,
        )
        playlist_id = int(playlist["id"])

        print("\n[base]")
        print(f"artista: {primary_artist_name} id={primary_artist_id}")
        print(f"playlist: {playlist_title} id={playlist_id}\n")
        return primary_artist_id, playlist_id

    imported = 0
    skipped = 0
    for index, entry in enumerate(entries, start=1):
        video_url = build_video_url(entry)
        try:
            title = entry.get("title") or f"Faixa {index}"
            duration = int(entry.get("duration") or 0)
            video_id = entry.get("id") or entry.get("url") or str(index)
            print(f"\n[{index}/{len(entries)}] {title}")

            if primary_artist_id is not None:
                existing_music = find_existing_music(supabase, title=title, artist_id=primary_artist_id)
                if existing_music:
                    _, current_playlist_id = ensure_import_base()
                    music_id = int(existing_music["id"])
                    print(f"[musica] ja existe: {existing_music.get('titulo')} id={music_id}; pulando download/upload")
                    link_playlist_music(supabase, current_playlist_id, music_id, index)
                    link_detected_feat_artists(
                        supabase,
                        music_id=music_id,
                        title=title,
                        primary_artist_name=primary_artist_name,
                    )
                    imported += 1
                    continue

            audio_file = Path(f"dry-run-{slugify(video_id, str(index))}.mp3")
            if not config.dry_run:
                audio_dir = config.workdir / "audio" / slugify(video_id, str(index))
                audio_dir.mkdir(parents=True, exist_ok=True)
                audio_file = download_audio(config, video_url, audio_dir)

            artist_id, current_playlist_id = ensure_import_base()

            cover_url = playlist_cover_url
            thumb = best_thumbnail(entry) or playlist_thumbnail
            if thumb:
                image_object_path = f"youtube/{slugify(primary_artist_name)}/{slugify(playlist_title)}/{slugify(video_id)}.jpg"
                image_file = Path(f"dry-run-{slugify(video_id, str(index))}.jpg")
                if not config.dry_run:
                    downloaded_cover = try_download_image(
                        thumb,
                        config.workdir / "images" / slugify(video_id, str(index)),
                        title,
                    )
                    if downloaded_cover:
                        image_file = downloaded_cover
                        image_object_path = (
                            f"youtube/{slugify(primary_artist_name)}/{slugify(playlist_title)}/"
                            f"{slugify(video_id)}{image_file.suffix}"
                        )
                    else:
                        image_file = None
                if image_file:
                    cover_url = supabase.upload_file(config.image_bucket, image_object_path, image_file, "image/jpeg" if config.dry_run else None)

            file_url = supabase.upload_file(
                config.music_bucket,
                f"youtube/{slugify(primary_artist_name)}/{slugify(playlist_title)}/{slugify(video_id)}.mp3",
                audio_file,
                "audio/mpeg",
            )

            music = find_or_create_music(
                supabase,
                title=title,
                genre=args.genre,
                duration=duration,
                artist_id=artist_id,
                file_url=file_url,
                cover_url=cover_url,
            )
            music_id = int(music["id"])
            link_playlist_music(supabase, current_playlist_id, music_id, index)
            link_detected_feat_artists(
                supabase,
                music_id=music_id,
                title=title,
                primary_artist_name=primary_artist_name,
            )

            imported += 1
        except YoutubeAccessBlockedError:
            raise
        except Exception as exc:
            skipped += 1
            print(f"[erro] falha ao importar {video_url}: {exc}", file=sys.stderr)

        if args.sleep > 0:
            time.sleep(args.sleep)

    if imported == 0:
        raise RuntimeError(
            "Nenhuma faixa acessivel foi importada. O YouTube pode ter bloqueado por idade, "
            "direitos, regiao, login obrigatorio ou limite de requisicoes."
        )

    print("\n[resumo]")
    print(f"faixas processadas: {len(entries)}")
    print(f"importadas/reutilizadas: {imported}")
    print(f"falhas: {skipped}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Importa playlist do YouTube para Supabase/Deefy.")
    parser.add_argument("--playlist-url", required=True, help="URL da playlist do YouTube.")
    parser.add_argument("--genre", required=True, help="Genero aplicado a todas as faixas desta importacao.")
    parser.add_argument("--owner-user-id", type=int, default=None, help="ID do usuario dono da playlist no Deefy.")
    parser.add_argument("--owner-user-email", default=None, help="E-mail do usuario dono da playlist. Padrao: deefy.admin@deefy.com.")
    parser.add_argument("--playlist-title", help="Nome manual da playlist global.")
    parser.add_argument("--artist-name", help="Nome manual do canal/artista principal.")
    parser.add_argument("--artist-photo-url", help="URL manual da foto do canal/artista.")
    parser.add_argument("--artist-bio", help="Bio manual do canal/artista.")
    parser.add_argument("--limit", type=int, help="Limita quantidade de videos para teste.")
    parser.add_argument("--private", action="store_true", help="Cria playlist como privada.")
    parser.add_argument("--dry-run", action="store_true", help="Mostra operacoes sem gravar/subir arquivos.")
    parser.add_argument("--sleep", type=float, default=0.0, help="Pausa entre videos, em segundos.")
    parser.add_argument("--workdir", default=None, help="Diretorio temporario de downloads.")
    parser.add_argument("--env-file", default=".env", help="Arquivo .env local com credenciais.")
    return parser.parse_args()


def build_config(args: argparse.Namespace) -> Config:
    load_env_file(Path(args.env_file))

    supabase_url = os.getenv("SUPABASE_PROJECT_URL") or os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    owner_user_id = args.owner_user_id or os.getenv("DEEFY_IMPORT_OWNER_USER_ID")
    owner_user_email = args.owner_user_email or os.getenv("DEEFY_IMPORT_OWNER_EMAIL") or "deefy.admin@deefy.com"

    missing = []
    if not supabase_url:
        missing.append("SUPABASE_PROJECT_URL ou SUPABASE_URL")
    if not service_key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        raise RuntimeError("Variaveis obrigatorias ausentes: " + ", ".join(missing))

    yt_dlp_bin = os.getenv("YT_DLP_BIN") or "yt-dlp"
    if not shutil.which(yt_dlp_bin):
        raise RuntimeError("yt-dlp nao encontrado. Instale com: python3 -m pip install --user yt-dlp")

    yt_dlp_options: list[str] = []
    cookies_file = (
        os.getenv("YTDLP_COOKIES_FILE")
        or os.getenv("YT_DLP_COOKIES_FILE")
        or ("/app/secrets/youtube-cookies.txt" if Path("/app/secrets/youtube-cookies.txt").is_file() else "")
    )
    if cookies_file:
        cookies_path = Path(cookies_file)
        if not cookies_path.is_file():
            raise RuntimeError(
                f"Arquivo de cookies do yt-dlp nao encontrado: {cookies_file}. "
                "Remova YTDLP_COOKIES_FILE ou monte um arquivo cookies.txt valido."
            )
        yt_dlp_options.extend(["--cookies", str(cookies_path)])

    node_path = shutil.which("node")
    js_runtime = os.getenv("YTDLP_JS_RUNTIME") or (f"node:{node_path}" if node_path else "")
    if js_runtime:
        yt_dlp_options.extend(["--js-runtimes", js_runtime])

    sleep_requests = os.getenv("YTDLP_SLEEP_REQUESTS")
    if sleep_requests:
        yt_dlp_options.extend(["--sleep-requests", sleep_requests])

    workdir = Path(args.workdir) if args.workdir else Path(tempfile.mkdtemp(prefix="deefy-youtube-import-"))
    return Config(
        supabase_url=supabase_url,
        service_key=service_key,
        music_bucket=os.getenv("SUPABASE_STORAGE_MUSIC_BUCKET", "musicas"),
        image_bucket=os.getenv("SUPABASE_STORAGE_IMAGE_BUCKET", "imagens"),
        owner_user_id=int(owner_user_id) if owner_user_id else None,
        owner_user_email=owner_user_email,
        public_playlist=not args.private,
        dry_run=args.dry_run,
        yt_dlp_bin=yt_dlp_bin,
        yt_dlp_options=yt_dlp_options,
        workdir=workdir,
    )


def main() -> int:
    args = parse_args()
    try:
        config = build_config(args)
        import_playlist(args, config)
        print(f"\nArquivos temporarios em: {config.workdir}")
        return 0
    except KeyboardInterrupt:
        print("\nImportacao interrompida pelo usuario.", file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
