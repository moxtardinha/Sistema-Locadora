import express from 'express';
import { alterarStatusFuncionario, createFuncionario, loginFuncionario, me } from '../controllers/funcionariosController.js';
import authGerencia from '../middlewares/authGerencia.js';
import authCheck from '../middlewares/auth.js';

const funcionariosRoute = express.Router();

funcionariosRoute.post("/login", loginFuncionario)
funcionariosRoute.post("/registrar", authGerencia, createFuncionario);
funcionariosRoute.post("/inativar", authGerencia, alterarStatusFuncionario);
funcionariosRoute.get("/me", authCheck,me);
export default funcionariosRoute;