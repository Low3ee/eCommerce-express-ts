import express from "express";
import cors from "cors";
import { config } from "dotenv";
import userRouter from "./routes/user-router.js";
import productRouter from "./routes/product-router.js";

config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cors());

app.use("/api/user", userRouter);
app.use("/api/products", productRouter);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;
