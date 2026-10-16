import express from "express";
import dotenv from 'dotenv';
import ClientesRouter from "./routes/clientesRoute.js";
import cors from 'cors';
import helmet from "helmet";
import carrosRoute from "./routes/carrosRoute.js";
import funcionariosRoute from "./routes/funcionariosRoute.js";
import aluguelRoute from "./routes/aluguelRoute.js";
import { rateLimit } from 'express-rate-limit';
dotenv.config({ quiet: true });
const PORT = process.env.PORT;
const FRONTORIGIN = process.env.FRONTORIGIN;
const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: FRONTORIGIN,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
const rateGeral = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: {message: "Muitas requisições feitas, bloqueado por razões de segurança!"}
})
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Muitas tentativas de login, tente novamente em alguns minutos." },
});
app.use(rateGeral)
app.use("/clientes",ClientesRouter);
app.use("/carros", carrosRoute);
app.use("/funcionarios/login", limiteLogin)
app.use("/funcionarios", funcionariosRoute);
app.use("/alugueis", aluguelRoute);
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});