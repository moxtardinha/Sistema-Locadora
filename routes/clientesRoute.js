import express from 'express';
import { createCliente, getAllClientes, getOneCliente, loginCliente } from '../controllers/clientesController.js';
import authCheck from '../middlewares/auth.js';

const ClientesRouter = express.Router();

ClientesRouter.post("/cadastro", createCliente);
ClientesRouter.post("/login", loginCliente);
ClientesRouter.get("/listar",authCheck, getAllClientes);
ClientesRouter.get("/listar/:cpf",authCheck, getOneCliente);


export default ClientesRouter;