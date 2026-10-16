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
        if (nome.length < 3 || cpf.length !== 11 || cnh.length !== 11 || senha.length < 5) {
            return res.status(400).json({ message: "Dados Muito curtos ou Inválidos" });
        }
        const prequerysyntax = "SELECT * FROM clientes where cpf=? OR cnh=?";
        const [prequery] = await db.query(prequerysyntax, [cpf, cnh]);
        if (prequery.length > 0) {
            return res.status(401).json({ message: "Usuário já existente!" });
        }
        const hashedpassword = await argon2id.hash(senha);
        const querysyntax = "INSERT INTO clientes (nome,cpf,senha,cnh) VALUES (?,?,?,?)";
        const data = [nome, cpf, hashedpassword, cnh];
        const [query] = await db.execute(querysyntax, data);
        return res
            .status(201)
            .json({ message: "Cliente criado com sucesso!", id: query.insertId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
};

export const getAllClientes = async (req, res) => {
    try {
        const querysyntax = "SELECT id, nome, cpf, cnh, ativo FROM clientes";
        const [query] = await db.execute(querysyntax);
        return res.status(200).json(query);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
}

export const getOneCliente = async (req, res) => {
    try {
        const cpf = req.params.cpf;
        if (!cpf || cpf.length !== 11) {
            return res.status(400).json({ message: "CPF solicitado não possui formato válido!" })
        }
        if (!validator.isNumeric(cpf)) {
            return res.status(400).json({ message: "CPF suporta apenas Números!" });
        }
        const querysyntax = "SELECT nome,cpf,cnh, ativo FROM clientes WHERE cpf=?";
        const [query] = await db.execute(querysyntax, [cpf]);
        return res.status(200).json(query);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }

}

export const InativarClienteByCPF = async (req, res) => {
    try {
        const cpf = req.params.cpf;
        if (!cpf || cpf.length !== 11) {
            return res.status(400).json({ message: "CPF solicitado não possui formato válido!" })
        }
        
        if (!validator.isNumeric(cpf)) {
            return res.status(400).json({ message: "CPF suporta apenas Números!" });
        }

        const [cliente] = await db.execute("SELECT id FROM clientes WHERE cpf=? AND ativo=true", [cpf]);
        if (cliente.length === 0) {
            return res.status(404).json({ message: "Cliente inexistente ou já inativo!" });
        }

        const [alugueisAtivos] = await db.execute("SELECT id_aluguel FROM alugueis WHERE id_cliente=? AND ativo=true", [cliente[0].id]);
        if (alugueisAtivos.length > 0) {
            return res.status(409).json({ message: "Cliente possui aluguel ativo e não pode ser inativado!" });
        }

        const querysyntax = "UPDATE clientes SET ativo=false WHERE cpf=?";
        const [query] = await db.execute(querysyntax, [cpf]);
        if (query.affectedRows === 0) {
            return res.status(404).json({ message: "Cliente inexistente!" });
        }
        return res.status(200).json({ message: "Cliente Inativado Com Sucesso!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
}

export const AtivarClienteByCPF = async (req, res) => {
  try {
    const cpf = req.params.cpf;
    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ message: "CPF solicitado não possui formato válido!" })
    }
    if (!validator.isNumeric(cpf)) {
      return res.status(400).json({ message: "CPF suporta apenas Números!" });
    }
    const querysyntax = "UPDATE clientes SET ativo=true WHERE cpf=?";
    const [query] = await db.execute(querysyntax, [cpf]);
    if (query.affectedRows === 0) {
      return res.status(404).json({ message: "Cliente inexistente!" });
    }
    return res.status(200).json({ message: "Cliente Ativado Com Sucesso!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}