--
-- PostgreSQL database dump
--

\restrict sChKGscQuidhrrKc8PXSkUaBrPOdNfs7oiai1FpyRqVhEqzUH0LIL24OAQw9sw6

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: coches; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.coches (
    id integer NOT NULL,
    marca character varying(50) NOT NULL,
    modelo character varying(50) NOT NULL,
    "año" integer,
    propietario_id integer,
    descripcion text,
    foto_url character varying(255)
);


ALTER TABLE public.coches OWNER TO admin;

--
-- Name: coches_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.coches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coches_id_seq OWNER TO admin;

--
-- Name: coches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.coches_id_seq OWNED BY public.coches.id;


--
-- Name: comentarios; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.comentarios (
    id integer NOT NULL,
    coche_id integer,
    usuario_id integer,
    contenido text NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comentarios OWNER TO admin;

--
-- Name: comentarios_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.comentarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comentarios_id_seq OWNER TO admin;

--
-- Name: comentarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.comentarios_id_seq OWNED BY public.comentarios.id;


--
-- Name: me_gusta; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.me_gusta (
    usuario_id integer NOT NULL,
    coche_id integer NOT NULL
);


ALTER TABLE public.me_gusta OWNER TO admin;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO admin;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO admin;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: coches id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.coches ALTER COLUMN id SET DEFAULT nextval('public.coches_id_seq'::regclass);


--
-- Name: comentarios id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.comentarios ALTER COLUMN id SET DEFAULT nextval('public.comentarios_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: coches; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.coches (id, marca, modelo, "año", propietario_id, descripcion, foto_url) FROM stdin;
1	Nissan	Skyline GT-R R34	1999	1	El rey del JDM. Stage 2 con 500cv.	\N
2	Mitsubishi	Lancer Evo IX	2006	2	Preparado para rally. Suspensión de competición.	\N
3	Porsche	911 GT3 RS	2023	3	Shark Blue. Directo del concesionario al circuito.	\N
4	Ford	Mustang GT	1967	4	Clásico americano. Motor V8 restaurado a estrenar.	\N
5	Toyota	GR Yaris	2021	5	El coche definitivo para tramos de montaña.	\N
6	BMW	M3 E46	2003	6	Laguna Seca Blue. El mejor chasis de la historia de BMW.	\N
7	Audi	RS6 Avant	2022	7	600cv para llevar a los niños al colegio.	\N
8	Lamborghini	Huracan STO	2022	8	Aerodinámica extrema para romper el crono.	\N
9	Ferrari	F40	1987	9	La pura esencia de la conducción sin ayudas.	\N
10	Subaru	WRX STI	2018	10	Sonido bóxer legendario y tracción total total.	\N
11	jaguar 	f type	\N	21	rojo	/uploads/1775231488236.jpg
\.


--
-- Data for Name: comentarios; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.comentarios (id, coche_id, usuario_id, contenido, fecha_registro) FROM stdin;
1	1	3	¡Menudo Skyline! El R34 es mi coche favorito.	2026-04-03 15:37:50.715273
2	3	1	Ese GT3 RS en Shark Blue es otro nivel.	2026-04-03 15:37:50.715273
3	9	2	Nada suena como un F40. Joya histórica.	2026-04-03 15:37:50.715273
4	4	15	¿Es el 390 o el 289? Precioso Mustang.	2026-04-03 15:37:50.715273
5	6	12	El E46 sigue siendo el M3 más bonito.	2026-04-03 15:37:50.715273
6	2	5	¡Dale gas en los tramos! Ese Evo es una bestia.	2026-04-03 15:37:50.715273
7	7	20	Algún día tendré ese RS6... ¡Vaya sleeper!	2026-04-03 15:37:50.715273
8	5	11	He probado el GR Yaris y es adictivo. ¡Disfrútalo!	2026-04-03 15:37:50.715273
\.


--
-- Data for Name: me_gusta; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.me_gusta (usuario_id, coche_id) FROM stdin;
19	8
3	8
17	3
17	5
17	8
9	6
7	5
5	4
13	8
4	7
18	3
16	6
6	7
9	7
18	7
19	6
15	9
17	6
19	2
7	10
16	5
11	3
18	4
8	8
6	8
17	1
9	3
5	9
8	4
20	6
5	3
4	2
17	4
14	7
16	2
12	7
2	2
4	5
2	9
18	10
10	7
14	9
19	10
8	7
14	10
11	7
19	3
7	3
13	9
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.usuarios (id, nombre, email, password, fecha_registro) FROM stdin;
1	Carlos_Rally	carlos_rally@test.com	$2b$10$hymC09t4YnpjXJlJZMXIL.88CSMI0QwP8KIimTkVDxqxAB7u34IKa	2026-04-03 15:37:23.708698
2	Elena_Drift	elena_drift@test.com	$2b$10$TFn6IAxhRNRZgzApey1xUeFydc0fjTNJY3hv7vhAWK9WmUnYujQE2	2026-04-03 15:37:23.791076
3	Marc_JDM	marc_jdm@test.com	$2b$10$iLhqnfraOFvcUbeQ.d58ye48WdO/ZlQiwyorPlIULSEc3TfzqTNXm	2026-04-03 15:37:23.880748
4	Sofia_Turbo	sofia_turbo@test.com	$2b$10$q6bu9Piq1CF1z9y9SRc.feRXnZnfe8Hi827AvqKCzr5tGuIiZpdEi	2026-04-03 15:37:23.956261
5	Javier_V8	javier_v8@test.com	$2b$10$bgrUfLvuZN8/Ot/LGPqsaugR6WqS7N38sA2P1LYiWQxUMiUf/zWiS	2026-04-03 15:37:24.03101
6	Lucia_Sport	lucia_sport@test.com	$2b$10$x.4OXCFKf//1of8IHOB16eriYOXQHg6GTBMKj3wZTNijBD4FPFAsG	2026-04-03 15:37:24.104967
7	Pablo_Nitro	pablo_nitro@test.com	$2b$10$y.hQFqRuwVJWXIxUYCapmeo2ub3ALBu4sA7MT2iOYMAkF6MvmcQY.	2026-04-03 15:37:24.178474
8	Marta_Classic	marta_classic@test.com	$2b$10$aC9lKw3L2Sfq.mBLWtED3OXZkC9VjJtwZCU4TAbe9dLF60GxuF0sC	2026-04-03 15:37:24.256216
9	Adrian_Supercar	adrian_supercar@test.com	$2b$10$GEw..FkferYbup41w9IwBuXnLBJuHD4QvMit/FXwrS9CsBbU976Xe	2026-04-03 15:37:24.331623
10	Sara_F1	sara_f1@test.com	$2b$10$iiLM1AfczfmEig8ByCN/k.uIJsar0W0FV9vkdh4n4WUgS1dhi60va	2026-04-03 15:37:24.409215
11	Dani_Offroad	dani_offroad@test.com	$2b$10$3mam4XB6RPB20wVaGHRCA.na6GNNNZ3bbiEi.BEzGVV5vLolU5wUG	2026-04-03 15:37:24.488872
12	Ivan_GTI	ivan_gti@test.com	$2b$10$7mrRyFlkb4.TfXYv97EKnOX3fdfgf85IDJ2uv8PiuwWQsCHm0DNx6	2026-04-03 15:37:24.570565
13	Raul_Tuning	raul_tuning@test.com	$2b$10$oJjL25eUmJ8StsToRA7z7.oYLGmvHHP/eNXs2DkIsuid1nQpauu4m	2026-04-03 15:37:24.656872
14	Nerea_Luxury	nerea_luxury@test.com	$2b$10$nUSrEZ3yrH9grfpuhzQgROyDL4iImeyH1NfECXwC1.a4vB1kaT3Q2	2026-04-03 15:37:24.736347
15	Hugo_Drift	hugo_drift@test.com	$2b$10$C3oz/niU3BXpW0lguiYQuOmtADbu5b1qNwRscXQD9t3RDnrqvFI7u	2026-04-03 15:37:24.813194
16	Paula_Evo	paula_evo@test.com	$2b$10$pQFi/ab9ifJ3pumaenWBu.5rvj5BfsYasm1y9Ud.1nCT129yi4O5m	2026-04-03 15:37:24.890954
17	Ruben_Quattro	ruben_quattro@test.com	$2b$10$F4/Hzbar3YL71GygNbYxEub/pF74xd4bdYvt1OxsNfdEreTNCAb7y	2026-04-03 15:37:24.966469
18	Clara_Mpower	clara_mpower@test.com	$2b$10$BB8BOSa5Z26tvsexZUf9COY/CIexPJCnhiFF7clTGjSu93HF6Nwr6	2026-04-03 15:37:25.041567
19	Mario_Stance	mario_stance@test.com	$2b$10$OW1/Epgyr.8mlWz6WXTayuwxMekONVTaVZhXioalAkkrZ6dkmOiiy	2026-04-03 15:37:25.152888
20	Alba_Jap	alba_jap@test.com	$2b$10$YCBV5Nd7JdkqzHObGqtoDegHSVHbCdjx6RpYzl5d/eloy8TBIE8iu	2026-04-03 15:37:25.244113
21	Victor	victor@test.com	$2b$10$MEBz2toy270oBHajjYxzye2viJW9/Yv39xNjDiEJzAcGVmT2L/Bsq	2026-04-03 15:50:49.374629
\.


--
-- Name: coches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.coches_id_seq', 11, true);


--
-- Name: comentarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.comentarios_id_seq', 8, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 21, true);


--
-- Name: coches coches_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.coches
    ADD CONSTRAINT coches_pkey PRIMARY KEY (id);


--
-- Name: comentarios comentarios_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_pkey PRIMARY KEY (id);


--
-- Name: me_gusta me_gusta_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.me_gusta
    ADD CONSTRAINT me_gusta_pkey PRIMARY KEY (usuario_id, coche_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: coches coches_propietario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.coches
    ADD CONSTRAINT coches_propietario_id_fkey FOREIGN KEY (propietario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: comentarios comentarios_coche_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_coche_id_fkey FOREIGN KEY (coche_id) REFERENCES public.coches(id) ON DELETE CASCADE;


--
-- Name: comentarios comentarios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: me_gusta me_gusta_coche_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.me_gusta
    ADD CONSTRAINT me_gusta_coche_id_fkey FOREIGN KEY (coche_id) REFERENCES public.coches(id) ON DELETE CASCADE;


--
-- Name: me_gusta me_gusta_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.me_gusta
    ADD CONSTRAINT me_gusta_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict sChKGscQuidhrrKc8PXSkUaBrPOdNfs7oiai1FpyRqVhEqzUH0LIL24OAQw9sw6

