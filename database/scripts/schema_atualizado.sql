CREATE TABLE PERFIL
(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE USUARIO
(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    perfil_id INT,

    CONSTRAINT fk_usuario_perfil
        FOREIGN KEY (perfil_id)
        REFERENCES PERFIL(id)
);

CREATE TABLE ARTISTA
(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    bio TEXT,
    fotoUrl TEXT
);

CREATE TABLE ALBUM
(
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    capaUrl TEXT,
    dataLancamento DATE,
    artista_id INT NOT NULL,

    CONSTRAINT fk_album_artista
        FOREIGN KEY (artista_id)
        REFERENCES ARTISTA(id)
);

CREATE TABLE MUSICA
(
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    duracao INT NOT NULL,
    genero VARCHAR(100) NOT NULL,
    previewUrl TEXT,
    capaUrl TEXT,
    arquivoUrl TEXT NOT NULL,
    album_id INT,

    CONSTRAINT fk_musica_album
        FOREIGN KEY (album_id)
        REFERENCES ALBUM(id)
);

CREATE TABLE PLAYLIST
(
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    publica BOOLEAN NOT NULL,
    dataCriacao TIMESTAMP NOT NULL,
    usuario_id INT,

    CONSTRAINT fk_playlist_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES USUARIO(id)
);

CREATE TABLE PLAYLIST_MUSICA
(
    playlist_id INT,
    musica_id INT,
    ordem INT,

    PRIMARY KEY (playlist_id, musica_id),

    CONSTRAINT fk_playlistmusica_playlist
        FOREIGN KEY (playlist_id)
        REFERENCES PLAYLIST(id),

    CONSTRAINT fk_playlistmusica_musica
        FOREIGN KEY (musica_id)
        REFERENCES MUSICA(id)
);

CREATE TABLE FAVORITO
(
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    musica_id INT,
    dataFavoritado TIMESTAMP NOT NULL,

    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES USUARIO(id),

    CONSTRAINT fk_favorito_musica
        FOREIGN KEY (musica_id)
        REFERENCES MUSICA(id)
);

CREATE TABLE HISTORICO_EXECUCAO
(
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    musica_id INT NOT NULL,
    dataHoraExecucao TIMESTAMP NOT NULL,
    tempoOuvido INT,

    CONSTRAINT fk_historico_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES USUARIO(id),

    CONSTRAINT fk_historico_musica
        FOREIGN KEY (musica_id)
        REFERENCES MUSICA(id)
);

CREATE TABLE LOG_AUDITORIA
(
    id SERIAL PRIMARY KEY,
    usuario_id INT,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    dataHora TIMESTAMP NOT NULL,

    CONSTRAINT fk_log_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES USUARIO(id)
);

CREATE TABLE ADMINISTRADOR
(
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,

    CONSTRAINT fk_admin_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES USUARIO(id)
);
