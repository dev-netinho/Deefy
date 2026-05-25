-- paginação para a tabela MUSICA
CREATE OR REPLACE FUNCTION paginacao_musica(numReg int, numPag int)
RETURNS SETOF musica AS $$
BEGIN
RETURN QUERY SELECT * FROM musica ORDER BY id LIMIT numReg OFFSEt ((numPag - 1)* numReg);
RETURN;
END;
$$ LANGUAGE plpgsql; 

--demonstração de uso:
SELECT * FROM paginacao_musica(5,1); 


-- paginacao para a tabela ALBUM

CREATE OR REPLACE FUNCTION paginacao_album(numReg int, numPag int)
RETURNS SETOF album AS $$
BEGIN
RETURN QUERY SELECT * FROM album ORDER BY id LIMIT numReg OFFSEt ((numPag - 1)* numReg);
RETURN;
END;
$$ LANGUAGE plpgsql; 

--demonstração de uso:
SELECT * FROM paginacao_album(3,1); 

-- paginacao para a tabela ARTISTA
CREATE OR REPLACE FUNCTION paginacao_artista(numReg int, numPag int)
RETURNS SETOF artista AS $$
BEGIN
RETURN QUERY SELECT * FROM artista ORDER BY id LIMIT numReg OFFSEt ((numPag - 1)* numReg);
RETURN;
END;
$$ LANGUAGE plpgsql; 

--demonstração de uso:
SELECT * FROM paginacao_artista(3,1); 

-- paginacao para a tabela PLAYLIST 
CREATE OR REPLACE FUNCTION paginacao_playlist(numReg int, numPag int)
RETURNS SETOF playlist AS $$
BEGIN
RETURN QUERY SELECT * FROM playlist ORDER BY id LIMIT numReg OFFSEt ((numPag - 1)* numReg);
RETURN;
END;
$$ LANGUAGE plpgsql; 

--demonstração de uso:
SELECT * FROM paginacao_playlist(3,1); 






