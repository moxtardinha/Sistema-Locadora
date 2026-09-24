import express from 'express';
import { createCliente, loginCliente } from '../controllers/clientesController.js';

const ClientesRouter = express.Router();

ClientesRouter.post("/cadastro", createCliente);
ClientesRouter.post("/login", loginCliente);

export default ClientesRouter;