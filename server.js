import Fastify from 'fastify'
import { Pool } from 'pg'
import cors from '@fastify/cors'

const sql = new Pool({
  user: "postgres",
  password: "senai", 
  host: "localhost",
  port: 5432,
  database: "ecom_maquiagem"
})

const servidor = Fastify()

await servidor.register(cors, {
  origin: '*'
})

// Teste API
servidor.get('/', async (request, reply) => {
  return { mensagem: 'API rodando!' }
})


// --- USUÁRIOS ---

// RF001: Cadastrar
servidor.post('/usuarios', async (request, reply) => {
  const { nome, email, senha, cpf } = request.body;
  
  if (!nome || !email || !senha || !cpf) {
    return reply.status(400).send({ error: 'Campos vazios ou informações inválidas' })
  }

  try {
    await sql.query('INSERT INTO usuarios (nome, email, senha, cpf) VALUES ($1, $2, $3, $4)', [nome, email, senha, cpf])
    return reply.status(201).send({ mensagem: "Usuário cadastrado com sucesso!" })
  } catch (error) {
    if (error.code === '23505') {
      return reply.status(400).send({ error: 'E-mail ou CPF já cadastrados.' })
    }
    return reply.status(500).send({ error: 'Erro interno no servidor.' })
  } // <-- CHAVE ADICIONADA AQUI PARA FECHAR O CATCH CORRETAMENTE
})

// RF002: Login
servidor.post('/usuarios/login', async (request, reply) => {
  const { email, senha } = request.body;

  if (!email || !senha) {
    return reply.status(400).send({ error: 'E-mail ou senha inválidos' })
  }

  const resultado = await sql.query('SELECT id, nome, email FROM usuarios WHERE email = $1 AND senha = $2', [email, senha])
  
  if (resultado.rows.length === 0) {
    return reply.status(401).send({ error: 'E-mail ou senha incorretos' })
  }

  return { 
    mensagem: "Login realizado com sucesso!", 
    usuario: resultado.rows[0] 
  }
})


// --- PRODUTOS ---

// RF003 e RF008: Buscar produtos (Geral, por Categoria ou por Busca)
servidor.get('/produtos', async (request, reply) => {
  const { categoria, busca } = request.query;
  let resultado;

  if (categoria) {
    resultado = await sql.query(
      'SELECT p.* FROM produtos p INNER JOIN categorias c ON p.id_categoria = c.id WHERE c.nome ILIKE $1', 
      [categoria]
    );
  } else if (busca) {
    resultado = await sql.query('SELECT * FROM produtos WHERE nome ILIKE $1', [`%${busca}%`]);
  } else {
    resultado = await sql.query('SELECT * FROM produtos');
  }

  return resultado.rows;
})

// RF004: Buscar detalhes de um produto pelo ID
servidor.get('/produtos/:id', async (request, reply) => {
  const { id } = request.params;
  
  const resultado = await sql.query('SELECT * FROM produtos WHERE id = $1', [id])
  
  if (resultado.rows.length === 0) {
    return reply.status(404).send({ error: 'Produto não encontrado!' })
  }
  
  return resultado.rows[0];
})


// --- PEDIDOS (Simulação de Compra) ---

// RF006 e RN001: Criar Pedido Simulado
servidor.post('/pedidos', async (request, reply) => {
  const { id_usuario, total, itens } = request.body; 

  // RN001: Valida se o usuário está logado
  if (!id_usuario) {
    return reply.status(401).send({ error: 'Você precisa estar logado para finalizar a compra.' })
  }

  if (!itens || itens.length === 0) {
    return reply.status(400).send({ error: 'O carrinho está vazio!' })
  }

  try {
    // 1. Cria o Pedido na tabela de pedidos (Simulando o status como 'Pago')
    const pedidoCriado = await sql.query(
      "INSERT INTO pedidos (id_usuario, total, status_pedido) VALUES ($1, $2, 'Pago') RETURNING id",
      [id_usuario, total]
    );
    const idPedido = pedidoCriado.rows[0].id;

    // 2. Salva cada item que foi comprado na tabela intermediária usando um loop simples
    for (const item of itens) {
      await sql.query(
        'INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
        [idPedido, item.id_produto, item.quantidade, item.preco_unitario]
      );
    }

    return reply.status(201).send({ 
      mensagem: 'Pedido finalizado com sucesso (Simulação concluída)!', 
      id_pedido: idPedido 
    });

  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao processar o pedido simulado.' })
  }
})

// RF007: Buscar histórico de pedidos de um usuário específico
servidor.get('/pedidos/usuario/:id_usuario', async (request, reply) => {
  const { id_usuario } = request.params;

  const resultado = await sql.query(
    'SELECT id, total, status_pedido, data_pedido FROM pedidos WHERE id_usuario = $1 ORDER BY data_pedido DESC',
    [id_usuario]
  );

  return resultado.rows;
})


// Inicialização do Servidor (Formato .then ensinado em sala)
servidor.listen({
  port: 3000
}).then(() => {
  console.log("Servidor rodando em http://localhost:3000")
})