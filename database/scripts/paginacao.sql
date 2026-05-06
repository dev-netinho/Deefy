CREATE OR REPLACE FUNCTION paginacao_musica(numReg int, numPag int)
RETURNS SETOF musica AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM musica
    ORDER BY id
    LIMIT numReg OFFSET ((numPag - 1) * numReg);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION paginacao_album(numReg int, numPag int)
RETURNS SETOF album AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM album
    ORDER BY id
    LIMIT numReg OFFSET ((numPag - 1) * numReg);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION paginacao_artista(numReg int, numPag int)
RETURNS SETOF artista AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM artista
    ORDER BY id
    LIMIT numReg OFFSET ((numPag - 1) * numReg);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION paginacao_playlist(numReg int, numPag int)
RETURNS SETOF playlist AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM playlist
    ORDER BY id
    LIMIT numReg OFFSET ((numPag - 1) * numReg);
END;
$$ LANGUAGE plpgsql;
