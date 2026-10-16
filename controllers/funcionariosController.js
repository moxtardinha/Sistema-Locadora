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
        cargo: funcionario.cargo
      },
      tokensecret,
      {
        expiresIn: "8h",
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
    const cargo = req.body.cargo;
    if (!nome || !cpf || !senha || !cargo) {
      return res.status(400).json({
        message: "Dados nulos não Aceitos!",
      });
    }

    if (!validator.isLength(nome, { min: 3, max: 100 })) {
      return res.status(400).json({
        message: "Nome deve possuir entre 3 e 100 caracteres!",
      });
    }
    if (cargo !== "funcionario" && cargo !== "gerencia") {
      return res
        .status(400)
        .json({ message: "Cargo deve ser 'funcionario' ou 'gerencia'!" });
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
    const querysyntax =
      "INSERT INTO funcionarios (nome,cpf,senha,ativo,cargo) VALUES (?,?,?,false,?)";
    const query = await db.execute(querysyntax, [
      nome,
      cpf,
      hashedpassword,
      cargo,
    ]);
    return res.status(201).json({ message: "Funcionário criado! Aguardando ativação.", id: query[0].insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
};

export const alterarStatusFuncionario = async (req, res) => {
  try {
    const id_funcionario = req.body.id_funcionario;
    const ativo = req.body.ativo;
    if (!id_funcionario || ativo === undefined || typeof ativo !== "boolean") {
      return res.status(400).json({ message: "Dados inválidos ou inexistentes!" });
    }
    const prequerysyntax = "SELECT cargo FROM funcionarios WHERE id_funcionario=?";
    const [prequery] = await db.execute(prequerysyntax, [id_funcionario]);
    if (prequery.length === 0) {
      return res.status(404).json({ message: "Funcionário inexistente!" });
    }
    if (prequery[0].cargo === "gerencia") {
      return res.status(403).json({ message: "Não é permitido alterar o status de um usuário da gerência!" });
    }
    const querysyntax = "UPDATE funcionarios SET ativo=? WHERE id_funcionario=?";
    await db.execute(querysyntax, [ativo, id_funcionario]);
    return res.status(200).json({ message: ativo ? "Funcionário ativado!" : "Funcionário desativado!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const me = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const { id } = jsonwebtoken.decode(token);
        const [rows] = await db.execute(
            "SELECT nome, cargo FROM funcionarios WHERE id_funcionario=? AND ativo=true",
            [id]
        );
        if (rows.length === 0) {
            return res.status(401).json({ message: "Funcionário inativo!" });
        }
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};