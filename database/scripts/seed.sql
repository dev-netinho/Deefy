-- Dados extras opcionais para desenvolvimento.
-- Todos os usuarios abaixo usam a senha: 123456

INSERT INTO usuario (nome, email, senha, tipo_usuario, created_at)
VALUES
('Bruno', 'bruno@email.com', '$2a$10$nRxrBmsqHiN.K9/MVPv7x.91GQ1eS7Mua69KO1Lt40TJRG1tSdQ2G', 0, CURRENT_TIMESTAMP),
('Carlos', 'carlos@email.com', '$2a$10$nRxrBmsqHiN.K9/MVPv7x.91GQ1eS7Mua69KO1Lt40TJRG1tSdQ2G', 0, CURRENT_TIMESTAMP),
('Mariana', 'mariana@email.com', '$2a$10$nRxrBmsqHiN.K9/MVPv7x.91GQ1eS7Mua69KO1Lt40TJRG1tSdQ2G', 0, CURRENT_TIMESTAMP),
('Lucas', 'lucas@email.com', '$2a$10$nRxrBmsqHiN.K9/MVPv7x.91GQ1eS7Mua69KO1Lt40TJRG1tSdQ2G', 0, CURRENT_TIMESTAMP);

INSERT INTO musica (titulo, duracao, genero)
VALUES
('Musica A', 200, 'Pop'),
('Musica B', 180, 'Rock'),
('Musica C', 220, 'Jazz');
