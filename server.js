import Fastify from 'fastify'
import { Pool } from 'pg'
import cors from '@fastify/cors'

const sql = new Pool({
  user: "postgres",
  password: "senai", 
  host: "localhost",
  port: 5432,
  database: "Ethereal"
})

const servidor = Fastify()


await servidor.register(cors, {
  origin: '*'
})


servidor.get('/', async (request, reply) => {
  return { mensagem: 'API Ethereal rodando!' }
})


//USUÁRIO

//Cadastrar Usuário
servidor.post('/usuarios', async (request, reply) => {
  const { nome, email, senha, cpf } = request.body;
  
  if (!nome || !email || !senha || !cpf) {
    return reply.status(400).send({ error: 'Campos vazios ou informações inválidas' })
  }

  //Verifica se e-mail existe
  const jaExiste = await sql.query('SELECT id FROM usuarios WHERE email = $1 OR cpf = $2', [email, cpf])
  if (jaExiste.rows.length > 0) {
    return reply.status(400).send({ error: 'E-mail ou CPF já cadastrados.' })
  }

  await sql.query('INSERT INTO usuarios (nome, email, senha, cpf) VALUES ($1, $2, $3, $4)', [nome, email, senha, cpf])
  return reply.status(201).send({ mensagem: "Usuário cadastrado com sucesso!" })
})

//Login 
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

// Buscar informações do usuário para "Minha Conta"
servidor.get('/usuarios/:id', async (request, reply) => {
  const { id } = request.params;
  
  const resultado = await sql.query('SELECT id, nome, email, senha, cpf, endereco FROM usuarios WHERE id = $1', [id])
  
  if (resultado.rows.length === 0) {
    return reply.status(404).send({ error: 'Usuário não encontrado!' })
  }
  
  return resultado.rows[0]
})

// Salvar ou Atualizar o endereço do usuário
servidor.put('/usuarios/:id/endereco', async (request, reply) => {
  const { id } = request.params;
  const { endereco } = request.body;

  if (!endereco) {
    return reply.status(400).send({ error: 'O endereço não pode estar vazio!' })
  }

  await sql.query('UPDATE usuarios SET endereco = $1 WHERE id = $2', [endereco, id])
  
  return { mensagem: 'Endereço atualizado com sucesso!' }
})


//PRODUTOS

//Buscar produtos
servidor.get('/produtos', async (request, reply) => {
  const { categoria, busca } = request.query;
  let resultado;

  if (categoria) {
    resultado = await sql.query(
      'SELECT p.* FROM produtos p INNER JOIN categorias c ON p.id_categoria = c.id WHERE c.nome ILIKE $1', 
      [categoria]
    )
  } else if (busca) {
    resultado = await sql.query('SELECT * FROM produtos WHERE nome ILIKE $1', [`%${busca}%`])
  } else {
    resultado = await sql.query('SELECT * FROM produtos')
  }

  return resultado.rows;
})

//detalhes de um produto 
servidor.get('/produtos/:id', async (request, reply) => {
  const { id } = request.params;
  
  const resultado = await sql.query('SELECT * FROM produtos WHERE id = $1', [id])
  
  if (resultado.rows.length === 0) {
    return reply.status(404).send({ error: 'Produto não encontrado!' })
  }
  
  return resultado.rows[0];
})


//PEDIDO

// Criar Pedido Simulado
servidor.post('/pedidos', async (request, reply) => {
  const { id_usuario, total, itens } = request.body; 

  if (!id_usuario) {
    return reply.status(401).send({ error: 'Você precisa estar logado para finalizar a compra.' })
  }

  if (!itens || itens.length === 0) {
    return reply.status(400).send({ error: 'O carrinho está vazio!' })
  }

  
  const pedidoCriado = await sql.query(
    "INSERT INTO pedidos (id_usuario, total, status_pedido) VALUES ($1, $2, 'Pago') RETURNING id",
    [id_usuario, total]
  )
  const idPedido = pedidoCriado.rows[0].id;

 
  for (const item of itens) {
    await sql.query(
      'INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
      [idPedido, item.id_produto, item.quantidade, item.preco_unitario]
    )
  }

  return reply.status(201).send({ 
    mensagem: 'Pedido finalizado com sucesso (Simulação concluída)!', 
    id_pedido: idPedido 
  })
})

//Buscar histórico de pedidos para exibir no perfil do usuário
servidor.get('/pedidos/usuario/:id_usuario', async (request, reply) => {
  const { id_usuario } = request.params;

  const resultado = await sql.query(
    'SELECT id, total, status_pedido, data_pedido FROM pedidos WHERE id_usuario = $1 ORDER BY data_pedido DESC',
    [id_usuario]
  )

  return resultado.rows;
})


servidor.listen({
  port: 3000
}).then(() => {
  console.log("Servidor rodando em http://localhost:3000")
})