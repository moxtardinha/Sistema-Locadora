import jsonwebtoken from "jsonwebtoken";
import db from "../database/db.js";

export default async function authGerencia(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token inexistente" });
    }
    const jwtsecret = process.env.JWTSECRET;
    const jwtcheck = jsonwebtoken.verify(token, jwtsecret);
    const querysyntax = "SELECT cargo, ativo FROM funcionarios WHERE id_funcionario=?";
    const [query] = await db.execute(querysyntax, [jwtcheck.id]);
    if (query.length === 0 || !query[0].ativo) {
      return res.status(401).json({ message: "Funcionário inexistente ou desativado" });
    }
    if (query[0].cargo !== "gerencia") {
      return res.status(403).json({ message: "Acesso restrito à gerência!" });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Token Inexistente ou Expirado" });
  }
}
