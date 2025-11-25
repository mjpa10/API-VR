const express = require("express");
const { PrismaClient } = require("@prisma/client");
// O bcrypt é crucial para garantir que você não armazene senhas em texto puro!
const bcrypt = require("bcrypt"); 

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Constante para o número de "rounds" de salt do bcrypt. 
// Geralmente 10 ou 12 são bons valores.
const saltRounds = 10; 

// ------------------------------------------
// 1. ROTAS PARA USUÁRIOS (Usuario)
// ------------------------------------------

// Rota para listar todos os usuários
// GET /usuarios
app.get("/usuarios", async (req, res) => {
  // Nota: O nome do modelo no cliente Prisma é sempre o singular: Usuario
  const usuarios = await prisma.usuario.findMany({
    // Não inclua o passwordHash na resposta!
    select: {
      nomeID: true,
      nome: true,
      email: true,
      passwordHash: true,
      createdAt: true,
    }
  });
  res.json(usuarios);
});

// GET /usuarios/:nomeID
app.get("/usuarios/:nomeID", async (req, res) => {
  const nomeID = parseInt(req.params.nomeID);

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { nomeID },
      select: {
        nomeID: true,
        nome: true,
        email: true,
        createdAt: true,
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json(usuario);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});

// Rota para criar um novo usuário (Cadastro/Registro)
// POST /usuarios
app.post("/usuarios", async (req, res) => {
  // Você precisa de Nome, Email e a Senha (plain text)
  const { nome, email, password } = req.body;
  
  if (!nome || !email || !password) {
    return res.status(400).json({ error: "Nome, Email e Senha são obrigatórios." });
  }

  try {
    // 1. GERAÇÃO DO HASH DA SENHA com bcrypt
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 2. CRIAÇÃO DO USUÁRIO no banco
    const usuario = await prisma.usuario.create({
      data: { nome, email, passwordHash // Armazena o hash, NUNCA a senha em texto puro!
},
      select: { // Retorna o usuário criado, mas sem o passwordHash
        nomeID: true,
        nome: true,
        email: true,
        createdAt: true,
      }
    });

    res.status(201).json(usuario);
  } catch (error) {
    // Código de erro P2002 é o erro de UNIQUE constraint (email duplicado)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Este e-mail já está em uso." });
    }
    console.error(error);
    res.status(500).json({ error: "Erro ao criar o usuário." });
  }
});

// ------------------------------------------
// 2. ROTAS PARA RESULTADOS (Exemplo)
// ------------------------------------------
// Rota para adicionar um novo resultado
// POST /resultados
app.post("/resultados", async (req, res) => {
  const { nomeID, pontuacao, acertos, erros } = req.body;

  try {
    const resultado = await prisma.resultado.create({
      data: {
        nomeID: parseInt(nomeID), // Converte para número
        pontuacao,
        acertos,
        erros,
      },
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registrar o resultado." });
  }
});

// GET todos os resultados
app.get("/resultados", async (req, res) => {
  try {
    const resultados = await prisma.resultado.findMany({
      include: {
        usuario: {
          select: {
            nomeID: true,
            nome: true,
            email: true,
          }
        }
      },
      orderBy: {
        resultadoID: 'desc' // Mais recentes primeiro (opcional)
      }
    });

    res.json(resultados);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar resultados." });
  }
});

  // GET /resultados/:resultadoID
app.get("/resultados/:resultadoID", async (req, res) => {
  const resultadoID = parseInt(req.params.resultadoID);

  try {
    const resultado = await prisma.resultado.findUnique({
      where: { resultadoID },
      include: {
        usuario: {
          select: {
            nomeID: true,
            nome: true,
            email: true,
          }
        }
      }
    });

    if (!resultado) {
      return res.status(404).json({ error: "Resultado não encontrado." });
    }

    res.json(resultado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar resultado." });
  }
});

// GET /usuarios/:nomeID/resultados
app.get("/usuarios/:nomeID/resultados", async (req, res) => {
  const nomeID = parseInt(req.params.nomeID);

  try {
    const resultados = await prisma.resultado.findMany({
      where: { nomeID },
      orderBy: { data: "desc" }
    });

    if (resultados.length === 0) {
      return res.status(404).json({ message: "Nenhum resultado encontrado para esse usuário." });
    }

    res.json(resultados);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar resultados do usuário." });
  }
});

// LOGIN - POST /login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const senhaCorreta = await bcrypt.compare(password, usuario.passwordHash);

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    return res.json({
      message: "Login realizado com sucesso!",
      nomeID: usuario.nomeID,
      nome: usuario.nome,
      email: usuario.email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor ao fazer login." });
  }
});


// ------------------------------------------
// INICIALIZAÇÃO DO SERVIDOR
// ------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));