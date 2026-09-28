import db from "../database/db.js";
import validator from "validator";
import argon2id from "argon2";
import jsonwebtoken from "jsonwebtoken";

export const loginFuncionario = async (req, res) => {
  try {
    const cpf = req.body.cpf;
    const senha = req.body.senha;
    if (!cpf || !senha) {
      return res.status(400).json({
        message: "Dados nulos não Aceitos!",
      });
    }
    if (!validator.isNumeric(cpf)) {
      return res.status(400).json({
        message: "Dados de campos numéricos não correspondidos!",
      });
    }
    const querysyntax = "SELECT * FROM funcionarios WHERE cpf=?";
    const [query] = await db.execute(querysyntax, [cpf]);
    if (query.length === 0) {
      return res.status(401).json({
        message: "Dados incorretos ou Inexistentes!",
      });
    }
    const funcionario = query[0];
    const hashcompare = await argon2id.verify(funcionario.senha, senha);
    if (!hashcompare) {
      return res.status(401).json({
        message: "Dados incorretos ou Inexistentes!",
      });
    }
    if (!funcionario.ativo) {
      return res.status(403).json({
        message: "Funcionário desativado!",
      });
    }
    const tokensecret = process.env.JWTSECRET;

    const token = jsonwebtoken.sign(
      {
        nome: funcionario.nome,
        id: funcionario.id_funcionario,
      },
      tokensecret,
      {
        expiresIn: "24h",
      },
    );
    return res.status(200).json({
      auth: true,
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
};

export const createFuncionario = async (req, res) => {
  try {
    const nome = req.body.nome;
    const cpf = req.body.cpf;
    const senha = req.body.senha;

    if (!nome || !cpf || !senha ) {
      return res.status(400).json({
        message: "Dados nulos não Aceitos!",
      });
    }

    if (!validator.isLength(nome, { min: 3, max: 100 })) {
      return res.status(400).json({
        message: "Nome deve possuir entre 3 e 100 caracteres!",
      });
    }

    if (
      !validator.isNumeric(cpf) ||
      !validator.isLength(cpf, { min: 11, max: 11 })
    ) {
      return res.status(400).json({
        message: "CPF deve possuir exatamente 11 números!",
      });
    }
    if (!validator.isLength(senha, { min: 8, max: 128 })) {
      return res.status(400).json({
        message: "Senha deve possuir entre 8 e 128 caracteres!",
      });
    }
    const prequerysyntax = "SELECT * FROM funcionarios WHERE cpf=?";
    const [prequery] = await db.execute(prequerysyntax, [cpf]);
    if (prequery.length !== 0) {
      return res.status(400).json({ message: "Funcionário Já cadastrado!" });
    }
    const hashedpassword = await argon2id.hash(senha);
    const querysyntax = "INSERT INTO funcionarios (nome,cpf,senha,ativo) VALUES (?,?,?,true)";
    const query = await db.execute(querysyntax, [nome,cpf,hashedpassword]);
    return res.status(200).json({ message: query[0].insertId });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
};
