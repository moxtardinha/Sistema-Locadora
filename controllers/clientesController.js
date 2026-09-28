import db from "../database/db.js";
import validator from "validator";
import argon2id from "argon2";

export const createCliente = async (req, res) => {
  try {
    const nome = req.body.nome;
    const cpf = req.body.cpf;
    const senha = req.body.senha;
    const cnh = req.body.cnh;

    if (!nome || !cpf || !senha || !cnh) {
      return res.status(400).json({ message: "Dados Nulos não Aceitos!" });
    }
    if (!validator.isNumeric(cpf) || !validator.isNumeric(cnh)) {
      return res
        .status(400)
        .json({ message: "Dados de campos numéricos não correspondidos!" });
    }
    if (
      nome.length < 3 ||
      cpf.length !== 11 ||
      cnh.length !== 11 ||
      senha.length < 5
    ) {
      return res
        .status(400)
        .json({ message: "Dados Muito curtos ou Inválidos" });
    }
    const prequerysyntax = "SELECT * FROM clientes where cpf=? OR cnh=?";
    const [prequery] = await db.query(prequerysyntax, [cpf,cnh]);
    if (prequery.length > 0) {
      return res.status(401).json({ message: "Usuário já existente!" });
    }
    const hashedpassword = await argon2id.hash(senha);
    const querysyntax = "INSERT INTO clientes VALUES (NULL,?,?,?,?)";
    const data = [nome, cpf, hashedpassword, cnh];
    const [query] = await db.execute(querysyntax, data);
    return res
      .status(200)
      .json({ message: "Usuário criado com sucesso!", id: query.insertID });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
        message: "Erro interno do servidor."
    });
  }
};

export const getAllClientes = async (req,res) => {
    try {
        const querysyntax = "SELECT nome, cpf, cnh FROM clientes";
        const query = await db.execute(querysyntax);
        return res.status(200).json(query);
    }catch(error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
    
    
}

export const getOneCliente = async (req,res) => {
    try {
        const cpf = req.params.cpf;
        if (!cpf || cpf.length !== 11) {
            return res.status(400).json({ message:"CPF solicitado não possui formato válido!" })
        }
        if (!validator.isNumeric(cpf)) {
            return res.status(400).json({ message:"CPF suporta apenas Números!" });
        }
        const querysyntax = "SELECT nome,cpf,cnh FROM clientes WHERE cpf=?";
        const [query] = await db.execute(querysyntax, [cpf]);
        return res.status(200).json(query);
    }catch(error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }

}

export const deleteClienteByCPF = async (req,res) => {
    try {
        const cpf = req.params.cpf;
        if (!cpf || cpf.length !== 11) {
            return res.status(400).json({ message:"CPF solicitado não possui formato válido!" })
        }
        if (!validator.isNumeric(cpf)) {
            return res.status(400).json({ message:"CPF suporta apenas Números!" });
        }
        const querysyntax = "DELETE FROM clientes WHERE cpf=?";
        const [query] = await db.execute(querysyntax, [cpf]);
        return res.status(200).json(query);
    }catch(error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
}