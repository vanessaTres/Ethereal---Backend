CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    endereco TEXT 
);


CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    imagem_url TEXT,
    descricao TEXT,
    id_categoria INTEGER REFERENCES categorias(id)
);


CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id),
    total DECIMAL(10,2) NOT NULL,
    status_pedido VARCHAR(20) DEFAULT 'Pago',
    metodo_pagamento VARCHAR(50), 
    endereco_entrega TEXT,      
    data_pedido TIMESTAMP DEFAULT NOW()
);


CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    id_produto INTEGER REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL
);

-- 1. Limpar os dados antigos para evitar duplicidade ou conflito de ID
TRUNCATE TABLE itens_pedido, pedidos, produtos, categorias RESTART IDENTITY CASCADE;

INSERT INTO categorias (nome) VALUES 
('Bases'),
('Pós'),
('Sombras'),
('Blushes'),
('Batons'),
('Iluminadores'),
('Delineadores');

-- Categoria: Bases
INSERT INTO produtos (id_categoria, nome, preco, descricao, imagem_url) VALUES
((SELECT id FROM categorias WHERE nome = 'Bases'), 'Base líquida BT', 60.00, 'Base líquida de alta cobertura Bruna Tavares', 'base_bt.jpg'),
((SELECT id FROM categorias WHERE nome = 'Bases'), 'Base líquida Glow', 30.90, 'Base líquida efeito iluminado natural', 'base_glow.jpg'),
((SELECT id FROM categorias WHERE nome = 'Bases'), 'Base cremosa AQ', 44.99, 'Base em bastão cremosa textura suave', 'base_aq.jpg'),
((SELECT id FROM categorias WHERE nome = 'Bases'), 'Base em pó OC', 26.99, 'Base em pó cobertura média controle de oleosidade', 'base_oc.jpg');

-- Categoria: Pós
INSERT INTO produtos (id_categoria, nome, preco, descricao, imagem_url) VALUES
((SELECT id FROM categorias WHERE nome = 'Pós'), 'Pó translúcido OC', 40.00, 'Pó facial solto translúcido Océane', 'po_oc.jpg'),
((SELECT id FROM categorias WHERE nome = 'Pós'), 'Pó de banana MM', 15.90, 'Pó solto finalizador banana Mia Make', 'po_mm.jpg'),
((SELECT id FROM categorias WHERE nome = 'Pós'), 'Pó translúcido VV', 44.99, 'Pó facial fixador translúcido Vivai', 'po_vv.jpg'),
((SELECT id FROM categorias WHERE nome = 'Pós'), 'Pó compacto TK', 20.99, 'Pó compacto acabamento matte Tracta', 'po_tk.jpg');

-- Categoria: Sombras
INSERT INTO produtos (id_categoria, nome, preco, descricao, imagem_url) VALUES
((SELECT id FROM categorias WHERE nome = 'Sombras'), 'Paleta de sombras AV', 60.00, 'Paleta de sombras tons neutros e cintilantes', 'paleta_av.jpg'),
((SELECT id FROM categorias WHERE nome = 'Sombras'), 'Paleta de sombras rosa OC', 30.90, 'Paleta de sombras tons rosados Océane', 'paleta_rosa_oc.jpg'),
((SELECT id FROM categorias WHERE nome = 'Sombras'), 'Paleta de sombras coloridas TB', 50.99, 'Paleta de sombras pigmentadas coloridas', 'paleta_tb.jpg'),
((SELECT id FROM categorias WHERE nome = 'Sombras'), 'Paleta de sombras coloridas ET', 39.99, 'Paleta de sombras vibes colorida compacta', 'paleta_et.jpg');

-- Categoria: Blushes
INSERT INTO produtos (id_categoria, nome, preco, descricao, imagem_url) VALUES
((SELECT id FROM categorias WHERE nome = 'Blushes'), 'Blush líquido BF', 20.00, 'Blush líquido de fácil aplicação Bella Femme', 'blush_bf.jpg'),
((SELECT id FROM categorias WHERE nome = 'Blushes'), 'Blush em pó AV', 25.90, 'Blush em pó alta pigmentação', 'blush_av.jpg'),
((SELECT id FROM categorias WHERE nome = 'Blushes'), 'Blush bastão cremosa', 29.99, 'Blush em bastão prático efeito natural', 'blush_bastao.jpg'),
((SELECT id FROM categorias WHERE nome = 'Blushes'), 'Blush em pó N', 30.00, 'Blush compacto tonalidade pêssego', 'blush_n.jpg');

-- Categoria: Batons
INSERT INTO produtos (id_categoria, nome, preco, descricao, imagem_url) VALUES
((SELECT id FROM categorias WHERE nome = 'Batons'), 'Batom bastão Dior', 200.00, 'Batom em bala luxo alta fixação Dior', 'batom_dior.jpg'),
((SELECT id FROM categorias WHERE nome = 'Batons'), 'Batom líquido NN', 25.90, 'Batom líquido matte de longa duração', 'batom_nn.jpg'),
((SELECT id FROM categorias WHERE nome = 'Batons'), 'Batom líquido EUD', 60.00, 'Batom líquido acabamento aveludado Eudora', 'batom_eud.jpg'),
((SELECT id FROM categorias WHERE nome = 'Batons'), 'Batom bastão AV', 40.00, 'Batom cremoso hidratante tradicional', 'batom_av.jpg');

-- Categoria: Iluminadores
INSERT INTO produtos (id_categoria, nome, preco, descricao, imagem_url) VALUES
((SELECT id FROM categorias WHERE nome = 'Iluminadores'), 'Iluminador Líquido V', 70.00, 'Iluminador líquido concentrado radiante Vult', 'iluminador_v.jpg'),
((SELECT id FROM categorias WHERE nome = 'Iluminadores'), 'Iluminador em pó N', 25.90, 'Iluminador compacto brilho dourado', 'iluminador_n.jpg'),
((SELECT id FROM categorias WHERE nome = 'Iluminadores'), 'Iluminador bastão OC', 60.00, 'Iluminador prático em bastão Océane', 'iluminador_bastao_oc.jpg'),
((SELECT id FROM categorias WHERE nome = 'Iluminadores'), 'Iluminador em pó BA', 30.00, 'Iluminador facial duo Belle Angel', 'iluminador_ba.jpg');

-- Categoria: Delineadores
INSERT INTO produtos (id_categoria, nome, preco, descricao, imagem_url) VALUES
((SELECT id FROM categorias WHERE nome = 'Delineadores'), 'Delineador EUD', 60.00, 'Delineador líquido preto absoluto Eudora', 'delineador_eud.jpg'),
((SELECT id FROM categorias WHERE nome = 'Delineadores'), 'Lápis de olho CM', 15.90, 'Lápis de olho delineador macio Colormake', 'lapis_cm.jpg'),
((SELECT id FROM categorias WHERE nome = 'Delineadores'), 'Delineador OC', 60.00, 'Delineador caneta ponta firme Océane', 'delineador_oc.jpg'),
((SELECT id FROM categorias WHERE nome = 'Delineadores'), 'Delineador CL', 30.00, 'Delineador líquido de ponta fina Cat Lovers', 'delineador_cl.jpg');