import express from 'express';
import { AtivarClienteByCPF, createCliente, getAllClientes, getOneCliente, InativarClienteByCPF } from '../controllers/clientesController.js';
import authCheck from '../middlewares/auth.js';

const ClientesRouter = express.Router();

ClientesRouter.post("/cadastro", createCliente);
ClientesRouter.get("/listar",authCheck, getAllClientes);
ClientesRouter.get("/listar/:cpf",authCheck, getOneCliente);
ClientesRouter.delete("/deletar/:cpf", authCheck, InativarClienteByCPF);
ClientesRouter.put("/ativar/:cpf", authCheck, AtivarClienteByCPF)
export default ClientesRouter;