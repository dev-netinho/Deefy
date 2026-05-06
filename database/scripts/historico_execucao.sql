-- Dados e consultas de teste para historico de execucao.
-- Rode depois de `schema.sql`, `insert.sql` e, se quiser mais dados, `seed.sql`.

INSERT INTO historico_execucao
(usuario_id, musica_id, datahoraexecucao, tempoouvido)
SELECT u.id, m.id, v.datahoraexecucao, v.tempoouvido
FROM (
    VALUES
        ('vitoria@uepa.br', 'Blinding Lights', NOW(), 120),
        ('vitoria@uepa.br', 'One More Time', NOW() - INTERVAL '10 minutes', 200),
        ('joao@email.com', 'Blinding Lights', NOW() - INTERVAL '30 minutes', 90),
        ('joao@email.com', 'Musica A', NOW() - INTERVAL '1 hour', 300),
        ('bruno@email.com', 'One More Time', NOW() - INTERVAL '2 hours', 150),
        ('bruno@email.com', 'Musica A', NOW() - INTERVAL '1 day', 180)
) AS v(email, titulo, datahoraexecucao, tempoouvido)
JOIN usuario u ON u.email = v.email
JOIN musica m ON m.titulo = v.titulo;

SELECT *
FROM historico_execucao
ORDER BY datahoraexecucao DESC;

SELECT *
FROM historico_execucao
WHERE usuario_id = (SELECT id FROM usuario WHERE email = 'vitoria@uepa.br');

SELECT *
FROM historico_execucao
ORDER BY datahoraexecucao DESC
LIMIT 3 OFFSET 0;

SELECT *
FROM historico_execucao
ORDER BY datahoraexecucao DESC
LIMIT 3 OFFSET 3;
