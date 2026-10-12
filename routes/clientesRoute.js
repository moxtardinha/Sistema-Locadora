import express from 'express';
import { createCliente, deleteClienteByCPF, getAllClientes, getOneCliente } from '../controllers/clientesController.js';
import authCheck from '../middlewares/auth.js';

const ClientesRouter = express.Router();

ClientesRouter.post("/cadastro", createCliente);
ClientesRouter.get("/listar",authCheck, getAllClientes);
ClientesRouter.get("/listar/:cpf",authCheck, getOneCliente);
ClientesRouter.delete("/deletar/:cpf", authCheck, deleteClienteByCPF) 

export default ClientesRouter;