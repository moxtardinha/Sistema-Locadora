import argon2id from "argon2";
import db from "../database/db.js";
import validator from "validator";


export const createAluguel = async (req,res) => {
    try {
        const id_cliente = req.body.id_cliente;
        const id_carro = req.body.id_carro;
        const data_inicio = req.body.data_inicio;
        const data_fim = req.body.data_fim;
        const valor_diaria = req.body.valor_diaria;
        const valor_total = req.body.valor_total;
        const senha_cliente = req.body.senha_cliente;
        console.log(typeof id_cliente, id_cliente);
        console.log(typeof id_carro, id_carro);
        if (!id_cliente || !id_carro || !data_inicio || !data_fim || !valor_diaria || !valor_total || !senha_cliente) {
            return res.status(400).json({ message: "Dados inválidos ou inexistentes!" });
        };
        if (!validator.isNumeric(id_carro) || !validator.isNumeric(id_cliente)) {
            return res.status(400).json({ message: "Apenas números permitidos nos campos ID!" });
        };
        if (!validator.isDecimal(valor_diaria) || !validator.isDecimal(valor_total)) {
            return res.status(400).json({ message: "Apenas valores decimais Aceitos!" });
        };

        const prequerysyntax = "SELECT * FROM alugueis WHERE id_carro=? AND ativo=true";
        const [prequery] = await db.execute(prequerysyntax, [id_carro]);
        if (prequery.length !== 0) {
            return res.status(400).json({ message: "Carro já alugado!" });
        };
        const authclientesyntax = "SELECT * FROM clientes WHERE id=?";
        const [authclientesquery]= await db.execute(authclientesyntax, [id_cliente]);
        if (authclientesquery.length === 0) {
            return res.status(400).json({ message: "Usuário inexistente!" });
        }

        const comparepasswords = await argon2id.verify(authclientesquery[0].senha, senha_cliente);
        if (!comparepasswords) {
            return res.status(400).json({ message: "Senha incorreta digitada!" });
        }
        const querysyntax = "INSERT INTO alugueis (id_cliente,id_carro,data_inicio,data_fim,valor_diaria,valor_total,ativo) VALUES (?,?,?,?,?,?,true)";
        const query = await db.execute(querysyntax, [id_cliente, id_carro, data_inicio, data_fim, valor_diaria, valor_total]);
        return res.status(200).json({ message: "Aluguel Registrado com sucesso!", queryid: query[0].insertId });
    }catch(error) {
        console.error(error);
        return res.status(500).json({
        message:"Erro ao registrar aluguel"
        });
    };
};

export const desativarAluguel = async (req,res) => {
    try {
        const id_aluguel = req.body.id_aluguel;
        const senha_cliente = req.body.senha_cliente;
        const id_cliente = req.body.id_cliente;
        if (!id_aluguel || !senha_cliente) {
            return res.status(400).json({ message: "Dados inválidos ou inexistentes!" });
        }
        const prequerysyntax = "SELECT * FROM alugueis WHERE id_aluguel=? AND ativo=true";
        const [prequery] = await db.execute(prequerysyntax, [id_aluguel]);
        if (prequery.length === 0) {
            return res.status(400).json({ message: "Aluguel inativo ou inexistente!" });
        }
        const authclientesyntax = "SELECT * FROM clientes WHERE id=?";
        const [authclientesquery] = await db.execute(authclientesyntax, [id_cliente]);
        if (authclientesquery.length === 0) {
            return res.status(401).json({ message: "Usuário Inexistente!" });
        }
        const comparepasswords = await argon2id.verify(authclientesquery[0].senha, senha_cliente);
        if (!comparepasswords) {
            return res.status(401).json({ message: "Senha Incorreta digitada!" });
        };
        const querysyntax = "UPDATE alugueis SET ativo=false WHERE id_aluguel=?";
        const [query] = await db.execute(querysyntax, [id_aluguel]);
        console.log(query);
        return res.status(200).json({ message: "Aluguel Desativado com sucesso!" })
    }catch(error) {
        console.error(error);
    }
};

export const listarAlugueis = async (req,res) => {
    try {
        const querysyntax = `SELECT
            a.id_aluguel as aluguel_id,
            a.ativo,
            c.nome as cliente_nome,
            c.cpf as cliente_cpf,
            c.cnh as cliente_cnh,
            ca.placa,
            ca.modelo,
            ca.complementos,
            ca.categoria,
            a.data_inicio,
            a.data_fim,
            a.valor_diaria,
            a.valor_total
            FROM alugueis a
            INNER JOIN clientes c ON a.id_cliente = c.id
            LEFT JOIN carros ca ON a.id_carro = ca.id_carro
        `;
        const [rows] = await db.execute(querysyntax);
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    };
};

export const listarAlugueisByID = async (req,res) => {
    const cliente_cpf = req.params.cpf;
    try {
        const querysyntax = `SELECT
            a.id_aluguel as aluguel_id,
            a.ativo,
            c.nome as cliente_nome,
            c.cpf as cliente_cpf,
            c.cnh as cliente_cnh,
            ca.placa,
            ca.modelo,
            ca.complementos,
            ca.categoria,
            a.data_inicio,
            a.data_fim,
            a.valor_diaria,
            a.valor_total
            FROM alugueis a
            INNER JOIN clientes c ON a.id_cliente = c.id
            LEFT JOIN carros ca ON a.id_carro = ca.id_carro
            WHERE c.cpf = ?
        `;
        const [rows] = await db.execute(querysyntax, [cliente_cpf]);
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    };
}
