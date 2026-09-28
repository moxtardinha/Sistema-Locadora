import express from 'express';
import { createFuncionario, loginFuncionario } from '../controllers/funcionariosController.js';

const funcionariosRoute = express.Router();

funcionariosRoute.post("/login", loginFuncionario)
funcionariosRoute.post("/registrar", createFuncionario);
export default funcionariosRoute;