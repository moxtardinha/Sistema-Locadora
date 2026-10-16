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
        const senha_cliente = req.body.senha_cliente;


        if (!id_cliente || !id_carro || !data_inicio || !data_fim || !valor_diaria || !senha_cliente) {
            return res.status(400).json({ message: "Dados inválidos ou inexistentes!" });
        };
        if (!validator.isNumeric(String(id_carro)) || !validator.isNumeric(String(id_cliente))) {
            return res.status(400).json({ message: "Apenas números permitidos nos campos ID!" });
        };
        if (!validator.isDecimal(String(valor_diaria)) || Number(valor_diaria) <= 0) {
            return res.status(400).json({ message: "Apenas valores decimais e positivos Aceitos!" });
        };
        
        const opcoesData = { format:"YYYY-MM-DD", strictMode:true }
        if (!validator.isDate(data_inicio, opcoesData) || !validator.isDate(data_fim, opcoesData)) {
            return res.status(400).json({ message: "Apenas Datas no formato YYYY-MM-DD!" });
        }
        const dias = Math.round((new Date(data_fim) - new Date(data_inicio)) / 86400000);
        if (dias < 0) {
            return res.status(400).json({ message: "A data final não pode ser antes da inicial!" });
        }
        const valor_total = (Number(valor_diaria) * Math.max(1, dias)).toFixed(2);

        const prequerycarrosyntax = "SELECT * FROM carros WHERE id_carro=?";
        const [prequerycarros] = await db.execute(prequerycarrosyntax, [id_carro]);
        if (prequerycarros.length === 0) {
            return res.status(400).json({ message: "Carro Inexistente ou Não registrado!" });
        }


        const prequeryaluguelsyntax = "SELECT * FROM alugueis WHERE id_carro=? AND ativo=true";
        const [prequeryaluguel] = await db.execute(prequeryaluguelsyntax, [id_carro]);
        if (prequeryaluguel.length !== 0) {
            return res.status(400).json({ message: "Carro já alugado!" });
        };

        const authclientesyntax = "SELECT * FROM clientes WHERE id=? AND ativo=true";
        const [authclientesquery]= await db.execute(authclientesyntax, [id_cliente]);
        if (authclientesquery.length === 0) {
            return res.status(400).json({ message: "Usuário inexistente!" });
        }

        const comparepasswords = await argon2id.verify(authclientesquery[0].senha, senha_cliente);
        if (!comparepasswords) {
            return res.status(403).json({ message: "Senha incorreta digitada!" });
        }

        const querysyntax = "INSERT INTO alugueis (id_cliente,id_carro,data_inicio,data_fim,valor_diaria,valor_total,ativo) VALUES (?,?,?,?,?,?,true)";

        const query = await db.execute(querysyntax, [id_cliente, id_carro, data_inicio, data_fim, valor_diaria, valor_total]);
        return res.status(200).json({ message: "Aluguel Registrado com sucesso!", queryid: query[0].insertId });

    }catch(error) {
        if (error.errno === 1062) {
            return res.status(409).json({ message: "Carro já alugado!" });
        }
        if (error.errno === 1452) {
            return res.status(404).json({ message: "Carro ou cliente inexistente!" });
        }
        console.error(error);
        return res.status(500).json({ message:"Erro ao registrar aluguel" });
    };
};

export const desativarAluguel = async (req,res) => {
    try {
        const id_aluguel = req.body.id_aluguel;
        const senha_cliente = req.body.senha_cliente;
        const id_cliente = req.body.id_cliente;
        if (!id_aluguel || !senha_cliente || !id_cliente) {
            return res.status(400).json({ message: "Dados inválidos ou inexistentes!" });
        }
        if (!validator.isInt(String(id_aluguel), { min:1 }) || !validator.isInt(String(id_cliente), { min:1 })) {
            return res.status(400).json({ message: "ID em formato não suportado!" })
        }
        const prequerysyntax = "SELECT * FROM alugueis WHERE id_aluguel=? AND ativo=true";
        const [prequery] = await db.execute(prequerysyntax, [id_aluguel]);
        if (prequery.length === 0) {
            return res.status(400).json({ message: "Aluguel inativo ou inexistente!" });
        }

        const authclientesyntax = "SELECT senha FROM clientes WHERE id=?";
        const [authclientesquery] = await db.execute(authclientesyntax, [id_cliente]);
        if (authclientesquery.length === 0) {
            return res.status(403).json({ message: "Usuário Inexistente!" });
        }
        const prequeryaluguelsyntax = "SELECT * FROM alugueis WHERE id_cliente = ? AND id_aluguel=?";
        const [prequeryaluguelquery] = await db.execute(prequeryaluguelsyntax, [id_cliente, id_aluguel]);
        if (prequeryaluguelquery.length === 0) {
            return res.status(404).json({ message: "Dados Inválidos ou cliente não possui esse aluguel!" })
        }

        const comparepasswords = await argon2id.verify(authclientesquery[0].senha, senha_cliente);
        if (!comparepasswords) {
            return res.status(403).json({ message: "Senha Incorreta digitada!" });
        };
        
        const querysyntax = "UPDATE alugueis SET ativo=false WHERE id_aluguel=? AND ativo=true";
        const [query] = await db.execute(querysyntax, [id_aluguel]);
        if (query.affectedRows === 0) {
            return res.status(409).json({ message: "Aluguel Já foi desativado!" })
        }
        console.log(query);
        return res.status(200).json({ message: "Aluguel Desativado com sucesso!" });
    }catch(error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no Servidor!" });
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

export const listarAlugueisByCPF = async (req,res) => {
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
};