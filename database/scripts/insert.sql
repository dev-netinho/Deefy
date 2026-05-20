-- 1. Tabelas Independentes (não dependem de ninguém)
INSERT INTO PERFIL (nome) VALUES ('Administrador'), ('Ouvinte');
INSERT INTO ARTISTA (nome, bio, fotoUrl) VALUES
('The Weeknd', 'Cantor e compositor canadense.', 'https://link-foto.com/weeknd.jpg'),
('Daft Punk', 'Duo francês de música eletrônica.', 'https://link-foto.com/daft.jpg');

-- 2. Tabelas de Segundo Nível (precisam de Perfil ou Artista)
INSERT INTO USUARIO (nome, email, senha, perfil_id) VALUES
('Vitoria', 'vitoria@uepa.br', 'senha123', 1),
('Joao Silva', 'joao@email.com', 'user123', 2);

INSERT INTO ALBUM (titulo, capaUrl, dataLancamento, artista_id) VALUES
('After Hours', 'https://capas.com/afterhours.jpg', '2020-03-20', 1),
('Discovery', 'https://capas.com/discovery.jpg', '2001-03-12', 2);

-- 3. Tabelas de Conteúdo (precisam do Álbum)
INSERT INTO MUSICA (deezerId, titulo, duracao, previewUrl, capaUrl, genero, album_id) VALUES
('893414922', 'Blinding Lights', 200, 'https://deezer.com/preview/1', 'https://capas.com/afterhours.jpg', 'Pop', 1),
('3135556', 'One More Time', 320, 'https://deezer.com/preview/2', 'https://capas.com/discovery.jpg', 'Electronic', 2);

-- 4. Tabelas de Relacionamento e Uso (dependem de Usuário e Música)
INSERT INTO PLAYLIST (nome, publica, dataCriacao, usuario_id)
VALUES ('Minhas Favoritas', true, CURRENT_TIMESTAMP, 1);

INSERT INTO PLAYLIST_MUSICA (playlist_id, musica_id, ordem) VALUES (1, 1, 1);

INSERT INTO FAVORITO (usuario_id, musica_id, dataFavoritado)
VALUES (1, 1, CURRENT_TIMESTAMP);

INSERT INTO HISTORICO_EXECUCAO (usuario_id, musica_id, dataHoraExecucao, tempoOuvido)
VALUES (1, 1, CURRENT_TIMESTAMP, 200);

INSERT INTO LOG_AUDITORIA (usuario_id, acao, descricao, dataHora)
VALUES (1, 'LOGIN', 'Usuario Vitoria logou no sistema', CURRENT_TIMESTAMP);
