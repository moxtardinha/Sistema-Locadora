import validator from "validator";
import db from "../database/db.js";

export const insertCarros = async (req,res) => {
    try {
        const modelo = req.body.modelo;
        const categoria = req.body.categoria;
        const complementos = req.body.complementos;
        const placa = typeof req.body.placa === "string" ? req.body.placa.trim().toUpperCase() : "";
        if (!modelo || !categoria || !complementos || !placa) {
            return res.status(400).json({ message: "Dados Inválidos ou Inexistentes!" })
        }
        if (placa.length !== 7) {
            return res.status(400).json({ message: "Formato da placa não suportado!" })
        }
        if (!validator.isLicensePlate(placa, 'pt-BR')) {
            return res.status(400).json({ message: "Formato de placa não suportado ou não condiz com os padrões brasileiros!" });
        }
        const prequerysyntax = "SELECT * FROM carros WHERE placa=?";
        const [prequery] = await db.execute(prequerysyntax, [placa]);
        if (prequery.length !== 0) {
            return res.status(400).json({ message: "Placa já registrada no Banco!" });
        }
        const querysyntax = "INSERT INTO carros (modelo,categoria,complementos,placa) VALUES (?,?,?,?)";
        const [query] = await db.execute(querysyntax, [modelo,categoria,complementos,placa]);
        return res.status(200).json({ message: "Carro Registrado!", id: query.insertId });
    }catch(error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor!" });
    }
}

export const getAllCarros = async (req,res) => {
    try {
        const querysyntax = "SELECT * FROM carros";
        const [query] = await db.execute(querysyntax);
        res.status(200).json({ query })
    }catch(error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor!" });
    }
}
export const getCarroByPlaca = async (req,res) => {
    try {
        const placa = typeof req.params.placa === "string" ? req.params.placa.trim().toUpperCase() : "";
        if (placa.length !== 7) {
            return res.status(400).json({ message: "Formato de placa não suportado!" });
        }
        if (!validator.isLicensePlate(placa, 'pt-BR')) {
            return res.status(400).json({ message: "Formato de placa não suportado ou não condiz com os padrões brasileiros!" });
        }
        const querysyntax = "SELECT * FROM carros WHERE placa=?";
        const [query] = await db.execute(querysyntax, [placa]);
        res.status(200).json({ query })
    }catch(error) {
        console.error(error)
        return res.status(500).json({ message: "Erro interno no servidor!" });
    }
};

export const deleteCarroByPlaca = async (req,res) => {
    try {
        const placa = typeof req.params.placa === "string" ? req.params.placa.trim().toUpperCase() : "";
        if (placa.length !== 7) {
            return res.status(400).json({ message: "Formato de placa não suportado!" });
        }
        if (!validator.isLicensePlate(placa, 'pt-BR')) {
            return res.status(400).json({ message: "Formato de placa não suportado ou não condiz com os padrões brasileiros!" });
        }
        const querysyntax = "DELETE FROM carros WHERE placa=?";
        const [query] = await db.execute(querysyntax, [placa]);
        if (query.affectedRows === 0) {
            return res.status(404).json({ message: "Carro não Encontrado!" })
        }
        res.status(200).json({ message: "Carro deletado com sucesso!" })
        
    }catch(error) {
        if (error.errno === 1451) {
            return res.status(409).json({ message: "Carro possui aluguéis vinculados e não pode ser excluído!" });
        }
        console.error(error)
        return res.status(500).json({ message: "Erro interno no servidor!" });
    }
}
