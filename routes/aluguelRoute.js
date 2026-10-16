import express from "express";
import { createAluguel, desativarAluguel, listarAlugueis, listarAlugueisByCPF} from "../controllers/aluguelController.js";
import authCheck from "../middlewares/auth.js";

const aluguelRoute = express.Router();

aluguelRoute.post("/cadastrar", authCheck ,createAluguel);
aluguelRoute.get("/listar", authCheck ,listarAlugueis);
aluguelRoute.get("/listar/:cpf", authCheck, listarAlugueisByCPF);
aluguelRoute.delete("/inativar", authCheck, desativarAluguel);

export default aluguelRoute;