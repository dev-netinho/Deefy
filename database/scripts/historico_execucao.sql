-- INSERÇÃO DE DADOS NO HISTÓRICO

INSERT INTO HISTORICO_EXECUCAO 
(usuario_id, musica_id, dataHoraExecucao, tempoOuvido)
VALUES 

-- Usuário 1
(1, 1, NOW(), 120),
(1, 2, NOW() - INTERVAL '10 minutes', 200),

-- Usuário 2
(2, 1, NOW() - INTERVAL '30 minutes', 90),
(2, 3, NOW() - INTERVAL '1 hour', 300),

-- Usuário 3
(3, 2, NOW() - INTERVAL '2 hours', 150),
(3, 3, NOW() - INTERVAL '1 day', 180);

-- CONSULTAS DE TESTE

-- Ordenação
SELECT * 
FROM HISTORICO_EXECUCAO
ORDER BY dataHoraExecucao DESC;

-- Filtrar por usuário
SELECT * 
FROM HISTORICO_EXECUCAO
WHERE usuario_id = 1;

-- Paginação - Página 1
SELECT * 
FROM HISTORICO_EXECUCAO
ORDER BY dataHoraExecucao DESC
LIMIT 3 OFFSET 0;

-- Paginação - Página 2
SELECT * 
FROM HISTORICO_EXECUCAO
ORDER BY dataHoraExecucao DESC
LIMIT 3 OFFSET 3;
