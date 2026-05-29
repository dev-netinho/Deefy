INSERT INTO public.perfil (id, nome)
VALUES
  (1, 'USER'),
  (2, 'ADMIN')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO public.usuario (id, nome, email, senha, perfil_id, fotoperfilurl)
VALUES
  (1, 'Usuario Demo', 'demo@deefy.local', '$2a$10$Dxuk3.7p.TKH8rSQqvr3qOAd6oFLDbePtLMrL5EiOxrc5OlyGXwz6', 1, NULL),
  (2, 'Admin Deefy', 'deefy.admin@deefy.com', '$2a$10$Dxuk3.7p.TKH8rSQqvr3qOAd6oFLDbePtLMrL5EiOxrc5OlyGXwz6', 2, NULL)
ON CONFLICT (email) DO UPDATE
SET nome = EXCLUDED.nome,
    senha = EXCLUDED.senha,
    perfil_id = EXCLUDED.perfil_id;

INSERT INTO public.administrador (id, usuario_id)
VALUES (1, 2)
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO public.artista (id, nome, bio, fotourl)
VALUES
  (1, 'Deefy Sessions', 'Artista demo usado para rodar o Deefy localmente sem dados privados.', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80'),
  (2, 'Local Beats', 'Projeto instrumental ficticio para testes de catalogo e player.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.genero (id, titulo, capaurl, datalancamento, artista_id)
VALUES
  (1, 'Trap', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80', CURRENT_DATE, 1),
  (2, 'Pop', 'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=600&q=80', CURRENT_DATE, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.musica (id, titulo, duracao, genero, capaurl, arquivourl, artista_id)
VALUES
  (1, 'Demo Groove', 372, 'Pop', 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?auto=format&fit=crop&w=600&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 1),
  (2, 'Local Night', 345, 'Trap', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 2),
  (3, 'Open Source Mood', 305, 'Pop', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.playlist (id, nome, publica, datacriacao, usuario_id, descricao, capaurl)
VALUES
  (1, 'Deefy Local Demo', true, CURRENT_TIMESTAMP, 2, 'Playlist publica demo para testar o projeto localmente.', 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80'),
  (2, 'Minha Playlist Local', false, CURRENT_TIMESTAMP, 1, 'Playlist privada do usuario demo.', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.playlist_musica (playlist_id, musica_id, ordem)
VALUES
  (1, 1, 1),
  (1, 2, 2),
  (1, 3, 3),
  (2, 1, 1)
ON CONFLICT (playlist_id, musica_id) DO NOTHING;

SELECT setval('public.perfil_id_seq', GREATEST((SELECT MAX(id) FROM public.perfil), 1), true);
SELECT setval('public.usuario_id_seq', GREATEST((SELECT MAX(id) FROM public.usuario), 1), true);
SELECT setval('public.administrador_id_seq', GREATEST((SELECT MAX(id) FROM public.administrador), 1), true);
SELECT setval('public.artista_id_seq', GREATEST((SELECT MAX(id) FROM public.artista), 1), true);
SELECT setval('public.album_id_seq', GREATEST((SELECT MAX(id) FROM public.genero), 1), true);
SELECT setval('public.musica_id_seq', GREATEST((SELECT MAX(id) FROM public.musica), 1), true);
SELECT setval('public.playlist_id_seq', GREATEST((SELECT MAX(id) FROM public.playlist), 1), true);
