-- 1. Tabelas independentes
INSERT INTO perfil (nome) VALUES
('Administrador'),
('Ouvinte');

INSERT INTO artista (nome, bio, fotourl) VALUES
('The Weeknd', 'Cantor e compositor canadense.', 'https://link-foto.com/weeknd.jpg'),
('Daft Punk', 'Duo frances de musica eletronica.', 'https://link-foto.com/daft.jpg');

-- 2. Tabelas de segundo nivel
-- Senhas BCrypt:
-- vitoria@uepa.br / senha123
-- joao@email.com / user123
INSERT INTO usuario (nome, email, senha, tipo_usuario, created_at, perfil_id) VALUES
('Vitoria', 'vitoria@uepa.br', '$2a$10$elOTzpPdMN3OXzZw8rfJyuLCErvhwBTL9fmUNHI3I3JNLuZqFsNZy', 1, CURRENT_TIMESTAMP, 1),
('Joao Silva', 'joao@email.com', '$2a$10$l.CRoTxvfou4AH9MFRbfFeTEqq1SErMzujB/X/2pfmZEtvtGr8ixi', 0, CURRENT_TIMESTAMP, 2);

INSERT INTO album (titulo, capaurl, datalancamento, artista_id) VALUES
('After Hours', 'https://capas.com/afterhours.jpg', '2020-03-20', 1),
('Discovery', 'https://capas.com/discovery.jpg', '2001-03-12', 2);

-- 3. Conteudo musical
INSERT INTO musica (deezerid, titulo, duracao, previewurl, capaurl, genero, album_id) VALUES
('893414922', 'Blinding Lights', 200, 'https://deezer.com/preview/1', 'https://capas.com/afterhours.jpg', 'Pop', 1),
('3135556', 'One More Time', 320, 'https://deezer.com/preview/2', 'https://capas.com/discovery.jpg', 'Electronic', 2);

-- 4. Relacionamentos e uso
INSERT INTO playlist (nome, publica, datacriacao, usuario_id) VALUES
('Minhas Favoritas', true, CURRENT_TIMESTAMP, 1);

INSERT INTO playlist_musica (playlist_id, musica_id, ordem) VALUES
(1, 1, 0);

INSERT INTO avaliacao (usuario_id, musica_id, nota, avaliado_em) VALUES
(1, 1, 5, CURRENT_TIMESTAMP);

INSERT INTO favorito (usuario_id, musica_id, datafavoritado) VALUES
(1, 1, CURRENT_TIMESTAMP);

INSERT INTO historico_execucao (usuario_id, musica_id, datahoraexecucao, tempoouvido) VALUES
(1, 1, CURRENT_TIMESTAMP, 200);

INSERT INTO log_auditoria (usuario_id, acao, descricao, datahora) VALUES
(1, 'LOGIN', 'Usuario Vitoria logou no sistema', CURRENT_TIMESTAMP);
