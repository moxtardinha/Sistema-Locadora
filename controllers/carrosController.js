import db from "../database/db.js";

export const insertCarros = async (req,res) => {
    try {
        const modelo = req.body.modelo;
        const categoria = req.body.categoria;
        const complementos = req.body.complementos;
        const placa = req.body.placa.toUpperCase();
        if (!modelo || !categoria || !complementos || !placa) {
            return res.status(400).json({ message: "Dados Inválidos ou Inexistentes!" })
        }
        if (placa.length !== 7) {
            return res.status(400).json({ message: "Formato da placa não suportado!" })
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
        const placa = req.params.placa;
        if (placa.length !== 7) {
            return res.status(400).json({ message: "Formato de placa não suportado!" });
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
        const placa = req.params.placa;
        if (placa.length !== 7) {
            return res.status(400).json({ message: "Formato de placa não suportado!" });
        }
        const querysyntax = "DELETE FROM carros WHERE placa=?";
        const [query] = await db.execute(querysyntax, [placa]);
        res.status(200).json({ message: "Carro deletado com sucesso!" })
        
    }catch(error) {
        console.error(error)
        return res.status(500).json({ message: "Erro interno no servidor!" });
    }
}
