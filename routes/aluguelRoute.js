import express from "express";
import { createAluguel } from "../controllers/aluguelController.js";


const aluguelRoute = express.Router();

aluguelRoute.post("/cadastrar", createAluguel);

export default aluguelRoute;