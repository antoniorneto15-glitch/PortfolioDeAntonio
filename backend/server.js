const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "portfolio"
});

db.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        return;
    }
    console.log("Conectado ao banco de dados MySQL!");
});

app.post("/api/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ success: false, message: "Informe usuário e senha." });
    }

    const query = "SELECT id, usuario FROM login WHERE usuario = ? AND password = ?";
    db.query(query, [usuario, senha], (err, results) => {
        if (err) {
            console.error("Erro na consulta:", err);
            return res.status(500).json({ success: false, message: "Erro no servidor." });
        }

        if (results.length > 0) {
            return res.json({ success: true, message: "Login realizado com sucesso!", user: results[0] });
        }

        return res.status(401).json({ success: false, message: "Usuário ou senha incorretos." });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
