PGDMP          
                {            capitan     13.5 (Ubuntu 13.5-2.pgdg20.04+1)     15.2 (Ubuntu 15.2-1.pgdg20.04+1) 	    ?           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            ?           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            ?           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            ?           1262    16386    capitan    DATABASE     s   CREATE DATABASE capitan WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'es_CO.UTF-8';
    DROP DATABASE capitan;
                pirela    false                        2615    2200    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                postgres    false            ?           0    0    SCHEMA public    ACL     Q   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
                   postgres    false    4            ?            1259    16387    products    TABLE     V  CREATE TABLE public.products (
    product_id uuid NOT NULL,
    parent_id uuid,
    init boolean,
    external_id text,
    search_text text,
    name text,
    price numeric,
    image text,
    json_product jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    sku text,
    store_product_id text
);
    DROP TABLE public.products;
       public         heap    pirela    false    4            ?          0    16387    products 
   TABLE DATA           ?   COPY public.products (product_id, parent_id, init, external_id, search_text, name, price, image, json_product, created_at, updated_at, sku, store_product_id) FROM stdin;
    public          pirela    false    200   ~	       R           2606    16394    products products_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);
 @   ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
       public            pirela    false    200            ?      x?????? ? ?     