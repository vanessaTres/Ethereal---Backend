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

// USUÁRIO
servidor.post('/usuarios', async (request, reply) => {
  const { nome, email, senha, cpf } = request.body;
  
  if (!nome || !email || !senha || !cpf) {
    return reply.status(400).send({ error: 'Campos vazios ou informações inválidas' })
  }

  const jaExiste = await sql.query('SELECT id FROM usuarios WHERE email = $1 OR cpf = $2', [email, cpf])
  if (jaExiste.rows.length > 0) {
    return reply.status(400).send({ error: 'E-mail ou CPF já cadastrados.' })
  }

  await sql.query('INSERT INTO usuarios (nome, email, senha, cpf) VALUES ($1, $2, $3, $4)', [nome, email, senha, cpf])
  return reply.status(201).send({ mensagem: "Usuário cadastrado com sucesso!" })
})

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
