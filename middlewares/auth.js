import jsonwebtoken from 'jsonwebtoken';
import db from '../database/db.js'
export default async function authCheck(req,res,next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ message: "Token inexistente" });
        }
        const jwtsecret = process.env.JWTSECRET;
        const jwtcheck = jsonwebtoken.verify(token, jwtsecret);
        if (!jwtcheck.id) {
            return res.status(401).json({ message: "Token adulterado ou não atende aos padrões estabelecidos!" });
        }
        const querysyntax = "SELECT * FROM funcionarios WHERE id_funcionario=? AND ativo=true";
        const [query] = await db.execute(querysyntax, [jwtcheck.id])
        if (query.length === 0) {
            return res.status(401).json({ message: "Funcionário inativo!" })
        };
        if (jwtcheck) {
            next();
        }else {
        return res.status(401).json({ message: "Token Inválido ou Expirado" });
        };   
    }catch(error) {
        console.error(error);
        return res.status(401).json({ message: "Token Inexistente ou Expirado" });
    }
    
}