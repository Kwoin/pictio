CREATE SCHEMA pictio
    AUTHORIZATION postgres;

CREATE SEQUENCE pictio.game_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE pictio.game_id_seq
    OWNER TO postgres;


CREATE TABLE IF NOT EXISTS pictio.game
(
    state character varying(10) COLLATE pg_catalog."default",
    id integer NOT NULL DEFAULT nextval('pictio.game_id_seq'::regclass),
    CONSTRAINT game_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE pictio.game
    OWNER to postgres;

CREATE INDEX game_index_id
    ON pictio.game USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE SEQUENCE pictio.user_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE pictio.user_id_seq
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS pictio."user"
(
    game_id integer NOT NULL,
    game_owner boolean NOT NULL,
    ready boolean NOT NULL,
    game_score integer NOT NULL,
    username character varying(25) COLLATE pg_catalog."default" NOT NULL,
    id integer NOT NULL DEFAULT nextval('pictio.user_id_seq'::regclass),
    connected boolean NOT NULL,
    success timestamp with time zone,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT game_id_fk FOREIGN KEY (game_id)
        REFERENCES pictio.game (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE pictio."user"
    OWNER to postgres;

CREATE INDEX fki_game_id_fk
    ON pictio."user" USING btree
    (game_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX user_id_index
    ON pictio."user" USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE SEQUENCE pictio."Round_id_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE pictio."Round_id_seq"
    OWNER TO postgres;


CREATE TABLE IF NOT EXISTS pictio.round
(
    id integer NOT NULL DEFAULT nextval('pictio."Round_id_seq"'::regclass),
    game_id integer NOT NULL,
    solo_user_id integer NOT NULL,
    creation timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    word text COLLATE pg_catalog."default" NOT NULL,
    "end" timestamp with time zone,
    CONSTRAINT "Round_pkey" PRIMARY KEY (id),
    CONSTRAINT game_id_fkey FOREIGN KEY (game_id)
        REFERENCES pictio.game (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT solo_user_id_fkey FOREIGN KEY (solo_user_id)
        REFERENCES pictio."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE pictio.round
    OWNER to postgres;

CREATE INDEX fki_game_id_fkey
    ON pictio.round USING btree
    (game_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX fki_solo_user_id_fkey
    ON pictio.round USING btree
    (solo_user_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE SEQUENCE pictio.picture_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE pictio.picture_id_seq
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS pictio.picture
(
    id integer NOT NULL DEFAULT nextval('pictio.picture_id_seq'::regclass),
    round_id integer NOT NULL,
    index integer NOT NULL,
    url character varying(2000) COLLATE pg_catalog."default" NOT NULL,
    author text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT picture_pkey PRIMARY KEY (id),
    CONSTRAINT round_id_fkey FOREIGN KEY (round_id)
        REFERENCES pictio.round (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE pictio.picture
    OWNER to postgres;

CREATE INDEX fki_round_id_fkey
    ON pictio.picture USING btree
    (round_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE SEQUENCE pictio.message_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE pictio.message_id_seq
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS pictio.message
(
    id integer NOT NULL DEFAULT nextval('pictio.message_id_seq'::regclass),
    round_id integer NOT NULL,
    user_id integer,
    type character varying(10) COLLATE pg_catalog."default" NOT NULL,
    creation time with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    text character varying(148) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT message_pkey PRIMARY KEY (id),
    CONSTRAINT round_id_fkey FOREIGN KEY (round_id)
        REFERENCES pictio.round (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT user_id_fkey FOREIGN KEY (user_id)
        REFERENCES pictio."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE pictio.message
    OWNER to postgres;


