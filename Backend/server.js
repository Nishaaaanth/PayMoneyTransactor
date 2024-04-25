import express from "express";
import mainRouter from "./routes/index.js";
import cors from "cors";

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/", mainRouter);

app.get('/', (req, res) => {
    res.json({msg: {
        user: "/api/v1/user",
        account: "/api/v1/account",
    }});
});

app.listen(PORT, ()=>console.log(`Listening on Port: ${PORT}`));
