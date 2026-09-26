import jsonwebtoken from 'jsonwebtoken';

export default function authCheck(req,res,next) {
    try {
        const token = req.body.token;
        if (!token) {
            return res.status(401).json({ message: "Token inexistente" });
        }
        const jwtsecret = process.env.JWTSECRET;
        const jwtcheck = jsonwebtoken.verify(token, jwtsecret);
        if (jwtcheck) {
            next();
        }else {
        return res.status(401).json({ message: "Token Inválido ou Expirado" });
        }   
    }catch(error) {
        console.error(error);
        return res.status(401).json({ message: "Token Inexistente ou Expirado" });
    }

}