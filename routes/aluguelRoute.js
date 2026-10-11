import express from "express";
import { createAluguel, desativarAluguel, listarAlugueis, listarAlugueisByID } from "../controllers/aluguelController.js";
import authCheck from "../middlewares/auth.js";

const aluguelRoute = express.Router();

aluguelRoute.post("/cadastrar", authCheck ,createAluguel);
aluguelRoute.get("/listar", authCheck ,listarAlugueis);
aluguelRoute.get("/listar/:cpf", authCheck, listarAlugueisByID);
aluguelRoute.delete("/inativar", authCheck, desativarAluguel);

export default aluguelRoute;