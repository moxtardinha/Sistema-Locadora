import express from "express";
import dotenv from 'dotenv';
import ClientesRouter from "./routes/clientesRoute.js";
import cors from 'cors';
import helmet from "helmet";
import carrosRoute from "./routes/carrosRoute.js";
import funcionariosRoute from "./routes/funcionariosRoute.js";
import aluguelRoute from "./routes/aluguelRoute.js";
dotenv.config({ quiet: true });
const PORT = process.env.PORT;
const app = express();
app.use(express.json());

app.use(cors());
app.use(helmet());
app.use("/clientes",ClientesRouter);
app.use("/carros", carrosRoute);
app.use("/funcionarios", funcionariosRoute);
app.use("/alugueis", aluguelRoute);
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});