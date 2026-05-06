CREATE TABLE perfil
(
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE usuario
(
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    tipo_usuario SMALLINT NOT NULL DEFAULT 0 CHECK (tipo_usuario BETWEEN 0 AND 1),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    perfil_id BIGINT,
    CONSTRAINT fk_usuario_perfil FOREIGN KEY (perfil_id) REFERENCES perfil (id)
);

CREATE TABLE artista
(
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    bio TEXT,
    fotourl VARCHAR(100)
);

CREATE TABLE album
(
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    capaurl VARCHAR(100),
    datalancamento DATE,
    artista_id BIGINT NOT NULL,
    CONSTRAINT fk_album_artista FOREIGN KEY (artista_id) REFERENCES artista (id)
);

CREATE TABLE musica
(
    id BIGSERIAL PRIMARY KEY,
    deezerid VARCHAR(100) UNIQUE,
    titulo VARCHAR(100) NOT NULL,
    duracao INTEGER NOT NULL,
    previewurl VARCHAR(100),
    capaurl VARCHAR(100),
    genero VARCHAR(100) NOT NULL,
    album_id BIGINT,
    CONSTRAINT fk_musica_album FOREIGN KEY (album_id) REFERENCES album (id)
);

CREATE TABLE playlist
(
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    publica BOOLEAN NOT NULL,
    datacriacao TIMESTAMP(6) NOT NULL,
    usuario_id BIGINT NOT NULL,
    CONSTRAINT fk_playlist_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);

CREATE TABLE playlist_musica
(
    playlist_id BIGINT NOT NULL,
    musica_id BIGINT NOT NULL,
    ordem INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, ordem),
    CONSTRAINT fk_playlist_musica_playlist FOREIGN KEY (playlist_id) REFERENCES playlist (id),
    CONSTRAINT fk_playlist_musica_musica FOREIGN KEY (musica_id) REFERENCES musica (id)
);

CREATE TABLE avaliacao
(
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    musica_id BIGINT NOT NULL,
    nota INTEGER NOT NULL,
    avaliado_em TIMESTAMP(6) NOT NULL,
    CONSTRAINT uk_avaliacao_usuario_musica UNIQUE (usuario_id, musica_id),
    CONSTRAINT fk_avaliacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
    CONSTRAINT fk_avaliacao_musica FOREIGN KEY (musica_id) REFERENCES musica (id)
);

CREATE TABLE favorito
(
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    musica_id BIGINT,
    datafavoritado TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_favorito_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
    CONSTRAINT fk_favorito_musica FOREIGN KEY (musica_id) REFERENCES musica (id)
);

CREATE TABLE historico_execucao
(
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    musica_id BIGINT NOT NULL,
    datahoraexecucao TIMESTAMP(6) NOT NULL,
    tempoouvido INTEGER,
    CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
    CONSTRAINT fk_historico_musica FOREIGN KEY (musica_id) REFERENCES musica (id)
);

CREATE TABLE log_auditoria
(
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    acao VARCHAR(100) NOT NULL,
    descricao VARCHAR(100),
    datahora TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_log_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);
