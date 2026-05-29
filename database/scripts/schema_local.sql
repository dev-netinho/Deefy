--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: genero; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genero (
    id integer NOT NULL,
    titulo character varying(100) NOT NULL,
    capaurl text,
    datalancamento date,
    artista_id integer NOT NULL
);


--
-- Name: paginacao_album(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.paginacao_album(numreg integer, numpag integer) RETURNS SETOF public.genero
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT * FROM album ORDER BY id LIMIT numReg OFFSEt ((numPag - 1)* numReg);
RETURN;
END;
$$;


--
-- Name: artista; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artista (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    bio text,
    fotourl text
);


--
-- Name: paginacao_artista(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.paginacao_artista(numreg integer, numpag integer) RETURNS SETOF public.artista
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT * FROM artista ORDER BY id LIMIT numReg OFFSEt ((numPag - 1)* numReg);
RETURN;
END;
$$;


--
-- Name: musica; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.musica (
    id integer NOT NULL,
    titulo character varying(100) NOT NULL,
    duracao integer NOT NULL,
    genero character varying(100) NOT NULL,
    capaurl text,
    arquivourl text NOT NULL,
    artista_id integer
);


--
-- Name: paginacao_musica(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.paginacao_musica(numreg integer, numpag integer) RETURNS SETOF public.musica
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT * FROM musica ORDER BY id LIMIT numReg OFFSEt ((numPag - 1)* numReg);
RETURN;
END;
$$;


--
-- Name: playlist_musica; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlist_musica (
    playlist_id integer NOT NULL,
    musica_id integer NOT NULL,
    ordem integer
);


--
-- Name: paginacao_playlist_musica(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.paginacao_playlist_musica(numreg integer, numpag integer) RETURNS SETOF public.playlist_musica
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT * FROM playlist_musica ORDER BY id LIMIT numReg OFFSEt ((numPag - 1)* numReg);
RETURN;
END;
$$;


--
-- Name: administrador; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administrador (
    id integer NOT NULL,
    usuario_id integer NOT NULL
);


--
-- Name: administrador_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.administrador_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: administrador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.administrador_id_seq OWNED BY public.administrador.id;


--
-- Name: album_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.album_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: album_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.album_id_seq OWNED BY public.genero.id;


--
-- Name: artista_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.artista_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: artista_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.artista_id_seq OWNED BY public.artista.id;


--
-- Name: favorito; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorito (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    musica_id integer,
    datafavoritado timestamp without time zone NOT NULL
);


--
-- Name: favorito_genero; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorito_genero (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    genero_id integer NOT NULL,
    datafavoritado timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: favorito_album_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorito_album_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorito_album_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorito_album_id_seq OWNED BY public.favorito_genero.id;


--
-- Name: favorito_artista; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorito_artista (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    artista_id integer NOT NULL,
    datafavoritado timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: favorito_artista_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorito_artista_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorito_artista_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorito_artista_id_seq OWNED BY public.favorito_artista.id;


--
-- Name: favorito_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorito_id_seq OWNED BY public.favorito.id;


--
-- Name: historico_execucao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historico_execucao (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    musica_id integer NOT NULL,
    datahoraexecucao timestamp without time zone NOT NULL,
    tempoouvido integer
);


--
-- Name: historico_execucao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.historico_execucao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: historico_execucao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.historico_execucao_id_seq OWNED BY public.historico_execucao.id;


--
-- Name: log_auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.log_auditoria (
    id integer NOT NULL,
    usuario_id integer,
    acao character varying(100) NOT NULL,
    descricao text,
    datahora timestamp without time zone NOT NULL
);


--
-- Name: log_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.log_auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: log_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.log_auditoria_id_seq OWNED BY public.log_auditoria.id;


--
-- Name: musica_artista; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.musica_artista (
    id integer NOT NULL,
    musica_id integer NOT NULL,
    artista_id integer NOT NULL,
    tipo_participacao character varying(40) DEFAULT 'FEAT'::character varying,
    ordem integer DEFAULT 0,
    datacriacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: musica_artista_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.musica_artista_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: musica_artista_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.musica_artista_id_seq OWNED BY public.musica_artista.id;


--
-- Name: musica_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.musica_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: musica_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.musica_id_seq OWNED BY public.musica.id;


--
-- Name: perfil; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.perfil (
    id integer NOT NULL,
    nome character varying(100) NOT NULL
);


--
-- Name: perfil_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.perfil_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: perfil_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.perfil_id_seq OWNED BY public.perfil.id;


--
-- Name: playlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlist (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    publica boolean NOT NULL,
    datacriacao timestamp without time zone NOT NULL,
    usuario_id integer,
    descricao text,
    capaurl text
);


--
-- Name: playlist_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.playlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: playlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.playlist_id_seq OWNED BY public.playlist.id;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    senha character varying(100) NOT NULL,
    perfil_id integer,
    fotoperfilurl text
);


--
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- Name: administrador id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrador ALTER COLUMN id SET DEFAULT nextval('public.administrador_id_seq'::regclass);


--
-- Name: artista id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artista ALTER COLUMN id SET DEFAULT nextval('public.artista_id_seq'::regclass);


--
-- Name: favorito id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito ALTER COLUMN id SET DEFAULT nextval('public.favorito_id_seq'::regclass);


--
-- Name: favorito_artista id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_artista ALTER COLUMN id SET DEFAULT nextval('public.favorito_artista_id_seq'::regclass);


--
-- Name: favorito_genero id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_genero ALTER COLUMN id SET DEFAULT nextval('public.favorito_album_id_seq'::regclass);


--
-- Name: genero id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genero ALTER COLUMN id SET DEFAULT nextval('public.album_id_seq'::regclass);


--
-- Name: historico_execucao id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_execucao ALTER COLUMN id SET DEFAULT nextval('public.historico_execucao_id_seq'::regclass);


--
-- Name: log_auditoria id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log_auditoria ALTER COLUMN id SET DEFAULT nextval('public.log_auditoria_id_seq'::regclass);


--
-- Name: musica id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.musica ALTER COLUMN id SET DEFAULT nextval('public.musica_id_seq'::regclass);


--
-- Name: musica_artista id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.musica_artista ALTER COLUMN id SET DEFAULT nextval('public.musica_artista_id_seq'::regclass);


--
-- Name: perfil id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perfil ALTER COLUMN id SET DEFAULT nextval('public.perfil_id_seq'::regclass);


--
-- Name: playlist id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist ALTER COLUMN id SET DEFAULT nextval('public.playlist_id_seq'::regclass);


--
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- Name: administrador administrador_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT administrador_pkey PRIMARY KEY (id);


--
-- Name: administrador administrador_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT administrador_usuario_id_key UNIQUE (usuario_id);


--
-- Name: genero album_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genero
    ADD CONSTRAINT album_pkey PRIMARY KEY (id);


--
-- Name: artista artista_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artista
    ADD CONSTRAINT artista_pkey PRIMARY KEY (id);


--
-- Name: favorito_genero favorito_album_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_genero
    ADD CONSTRAINT favorito_album_pkey PRIMARY KEY (id);


--
-- Name: favorito_artista favorito_artista_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_artista
    ADD CONSTRAINT favorito_artista_pkey PRIMARY KEY (id);


--
-- Name: favorito_artista favorito_artista_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_artista
    ADD CONSTRAINT favorito_artista_unique UNIQUE (usuario_id, artista_id);


--
-- Name: favorito_genero favorito_genero_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_genero
    ADD CONSTRAINT favorito_genero_unique UNIQUE (usuario_id, genero_id);


--
-- Name: favorito favorito_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT favorito_pkey PRIMARY KEY (id);


--
-- Name: favorito favorito_usuario_musica_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT favorito_usuario_musica_unique UNIQUE (usuario_id, musica_id);


--
-- Name: historico_execucao historico_execucao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_execucao
    ADD CONSTRAINT historico_execucao_pkey PRIMARY KEY (id);


--
-- Name: log_auditoria log_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log_auditoria
    ADD CONSTRAINT log_auditoria_pkey PRIMARY KEY (id);


--
-- Name: musica_artista musica_artista_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.musica_artista
    ADD CONSTRAINT musica_artista_pkey PRIMARY KEY (id);


--
-- Name: musica musica_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.musica
    ADD CONSTRAINT musica_pkey PRIMARY KEY (id);


--
-- Name: perfil perfil_nome_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perfil
    ADD CONSTRAINT perfil_nome_key UNIQUE (nome);


--
-- Name: perfil perfil_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perfil
    ADD CONSTRAINT perfil_pkey PRIMARY KEY (id);


--
-- Name: playlist_musica playlist_musica_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_musica
    ADD CONSTRAINT playlist_musica_pkey PRIMARY KEY (playlist_id, musica_id);


--
-- Name: playlist playlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist
    ADD CONSTRAINT playlist_pkey PRIMARY KEY (id);


--
-- Name: favorito_genero uq_favorito_album; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_genero
    ADD CONSTRAINT uq_favorito_album UNIQUE (usuario_id, genero_id);


--
-- Name: favorito_artista uq_favorito_artista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_artista
    ADD CONSTRAINT uq_favorito_artista UNIQUE (usuario_id, artista_id);


--
-- Name: musica_artista uq_musica_artista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.musica_artista
    ADD CONSTRAINT uq_musica_artista UNIQUE (musica_id, artista_id);


--
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: favorito_genero favorito_genero_genero_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_genero
    ADD CONSTRAINT favorito_genero_genero_id_fkey FOREIGN KEY (genero_id) REFERENCES public.genero(id);


--
-- Name: administrador fk_admin_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT fk_admin_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- Name: genero fk_album_artista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genero
    ADD CONSTRAINT fk_album_artista FOREIGN KEY (artista_id) REFERENCES public.artista(id);


--
-- Name: favorito_genero fk_favorito_album_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_genero
    ADD CONSTRAINT fk_favorito_album_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- Name: favorito_artista fk_favorito_artista_artista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_artista
    ADD CONSTRAINT fk_favorito_artista_artista FOREIGN KEY (artista_id) REFERENCES public.artista(id);


--
-- Name: favorito_artista fk_favorito_artista_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito_artista
    ADD CONSTRAINT fk_favorito_artista_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- Name: favorito fk_favorito_musica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT fk_favorito_musica FOREIGN KEY (musica_id) REFERENCES public.musica(id);


--
-- Name: favorito fk_favorito_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorito
    ADD CONSTRAINT fk_favorito_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- Name: historico_execucao fk_historico_musica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_execucao
    ADD CONSTRAINT fk_historico_musica FOREIGN KEY (musica_id) REFERENCES public.musica(id);


--
-- Name: historico_execucao fk_historico_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_execucao
    ADD CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- Name: log_auditoria fk_log_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log_auditoria
    ADD CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- Name: musica_artista fk_musica_artista_artista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.musica_artista
    ADD CONSTRAINT fk_musica_artista_artista FOREIGN KEY (artista_id) REFERENCES public.artista(id) ON DELETE CASCADE;


--
-- Name: musica_artista fk_musica_artista_musica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.musica_artista
    ADD CONSTRAINT fk_musica_artista_musica FOREIGN KEY (musica_id) REFERENCES public.musica(id) ON DELETE CASCADE;


--
-- Name: playlist fk_playlist_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist
    ADD CONSTRAINT fk_playlist_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);


--
-- Name: playlist_musica fk_playlistmusica_musica; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_musica
    ADD CONSTRAINT fk_playlistmusica_musica FOREIGN KEY (musica_id) REFERENCES public.musica(id);


--
-- Name: playlist_musica fk_playlistmusica_playlist; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_musica
    ADD CONSTRAINT fk_playlistmusica_playlist FOREIGN KEY (playlist_id) REFERENCES public.playlist(id);


--
-- Name: usuario fk_usuario_perfil; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_usuario_perfil FOREIGN KEY (perfil_id) REFERENCES public.perfil(id);


--
-- Name: musica musica_artista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.musica
    ADD CONSTRAINT musica_artista_id_fkey FOREIGN KEY (artista_id) REFERENCES public.artista(id);


--
-- Name: artista Permitir leitura publica de artistas; Type: POLICY; Schema: public; Owner: -
--



--
-- Name: genero Permitir leitura publica de generos; Type: POLICY; Schema: public; Owner: -
--



--
-- Name: musica Permitir leitura publica de musicas; Type: POLICY; Schema: public; Owner: -
--



--
-- Name: administrador; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: artista; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: favorito; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: favorito_artista; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: favorito_genero; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: genero; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: historico_execucao; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: log_auditoria; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: musica; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: musica_artista; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: perfil; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: playlist; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: playlist_musica; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- Name: usuario; Type: ROW SECURITY; Schema: public; Owner: -
--


--
-- PostgreSQL database dump complete
--
