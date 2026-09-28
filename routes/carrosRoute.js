import express from 'express';
import { deleteCarroByPlaca, getAllCarros, getCarroByPlaca, insertCarros, } from '../controllers/carrosController.js';
import authCheck from '../middlewares/auth.js';

const carrosRoute = express.Router();

carrosRoute.post("/cadastrar", authCheck ,insertCarros);
carrosRoute.get("/listar", authCheck, getAllCarros);
carrosRoute.get("/listar/:placa", authCheck, getCarroByPlaca);
carrosRoute.delete("/deletar/:placa", authCheck, deleteCarroByPlaca);

export default carrosRoute;