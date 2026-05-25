-- Inserir Artistas
INSERT INTO artista (nome, bio, fotourl) VALUES
('The Beatles', 'Banda britanica de rock', 'https://i.scdn.co/image/ab6761610000e5eb3e2d5b8c2f4f4c4c2f4f4c4c');

INSERT INTO artista (nome, bio, fotourl) VALUES
('Queen', 'Banda britanica de rock', 'https://i.scdn.co/image/ab6761610000e5eb7e2d5b8c2f4f4c4c2f4f4c4c');

INSERT INTO artista (nome, bio, fotourl) VALUES
('Michael Jackson', 'Rei do Pop', 'https://i.scdn.co/image/ab6761610000e5eb8e2d5b8c2f4f4c4c2f4f4c4c');

INSERT INTO artista (nome, bio, fotourl) VALUES
('Led Zeppelin', 'Banda britanica de rock pesado', 'https://i.scdn.co/image/ab6761610000e5eb9e2d5b8c2f4f4c4c2f4f4c4c');

INSERT INTO artista (nome, bio, fotourl) VALUES
('Pink Floyd', 'Banda britanica de rock progressivo', 'https://i.scdn.co/image/ab6761610000e5ebae2d5b8c2f4f4c4c2f4f4c4c');

-- Inserir Albuns
INSERT INTO album (titulo, capaurl, datalancamento, artista_id) VALUES
('Abbey Road', 'https://i.scdn.co/image/ab67616d0000e5eb4e2d5b8c2f4f4c4c2f4f4c4c', '1969-09-26', 1);

INSERT INTO album (titulo, capaurl, datalancamento, artista_id) VALUES
('A Night at the Opera', 'https://i.scdn.co/image/ab67616d0000e5eb5e2d5b8c2f4f4c4c2f4f4c4c', '1975-11-21', 2);

INSERT INTO album (titulo, capaurl, datalancamento, artista_id) VALUES
('Thriller', 'https://i.scdn.co/image/ab67616d0000e5eb6e2d5b8c2f4f4c4c2f4f4c4c', '1982-11-30', 3);

INSERT INTO album (titulo, capaurl, datalancamento, artista_id) VALUES
('Led Zeppelin IV', 'https://i.scdn.co/image/ab67616d0000e5eb7e2d5b8c2f4f4c4c2f4f4c4c', '1971-11-08', 4);

INSERT INTO album (titulo, capaurl, datalancamento, artista_id) VALUES
('The Dark Side of the Moon', 'https://i.scdn.co/image/ab67616d0000e5eb8e2d5b8c2f4f4c4c2f4f4c4c', '1973-03-01', 5);

-- Inserir Musicas
INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('Come Together', 259, 'Rock', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb4e2d5b8c2f4f4c4c2f4f4c4c', '/music/come_together.mp3', 1);

INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('Something', 182, 'Rock', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb4e2d5b8c2f4f4c4c2f4f4c4c', '/music/something.mp3', 1);

INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('Bohemian Rhapsody', 354, 'Rock', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb5e2d5b8c2f4f4c4c2f4f4c4c', '/music/bohemian_rhapsody.mp3', 2);

INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('We Will Rock You', 122, 'Rock', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb5e2d5b8c2f4f4c4c2f4f4c4c', '/music/we_will_rock_you.mp3', 2);

INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('Thriller', 357, 'Pop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb6e2d5b8c2f4f4c4c2f4f4c4c', '/music/thriller.mp3', 3);

INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('Billie Jean', 294, 'Pop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb6e2d5b8c2f4f4c4c2f4f4c4c', '/music/billie_jean.mp3', 3);

INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('Stairway to Heaven', 482, 'Rock', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb7e2d5b8c2f4f4c4c2f4f4c4c', '/music/stairway_to_heaven.mp3', 4);

INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('Black Dog', 296, 'Rock', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb7e2d5b8c2f4f4c4c2f4f4c4c', '/music/black_dog.mp3', 4);

INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('Speak to Me', 68, 'Rock Progressivo', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb8e2d5b8c2f4f4c4c2f4f4c4c', '/music/speak_to_me.mp3', 5);

INSERT INTO musica (titulo, duracao, genero, previewurl, capaurl, arquivourl, album_id) VALUES
('Time', 413, 'Rock Progressivo', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'https://i.scdn.co/image/ab67616d0000e5eb8e2d5b8c2f4f4c4c2f4f4c4c', '/music/time.mp3', 5);