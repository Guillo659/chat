import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { routerApi } from "../routes/routes.js";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors())
const server = createServer(app, {
  connectionStateRecovery: {},
});

const io = new Server(server);
const PORT = 3000;

const db = createClient({
  url: process.env.DB_URL,
  authToken: process.env.BD_AUTH,
});

await db.execute(`
  create table if not exists messages (
    id integer primary key autoincrement,
    content text,
    user varchar(250)
  )
  `);

app.disable("x-powered-by");

const socketUsers = []

io.on("connection", async (socket) => {
  console.log("User connected", socket.id);

  socket.on('register', (userId) => {
    if (socketUsers[userId]) {
      io.to(socket.id).emit('re-write', 'no repitas')
      console.log('Ya existe un usuario', socket.id)
    }
    socketUsers[userId] = socket.id
  })

  if (!socket.recovered) {
    try {
      const res = await db.execute({
        sql: `select id, content, user from messages where id > ?`,
        args: [socket.handshake.auth.serverOffset],
      });

      res.rows.forEach((row) => {
        io.to(socket.id).emit("broadcast", row.content, row.id.toString(), row.user);
      });
    } catch (err) {
      console.error(err);
    }
  }

  socket.on("broadcast", async (msg) => {
    const user = socket.handshake.auth.user
    let res;
    try {
      res = await db.execute({
        sql: `insert into messages (content, user) values (:msg, :user)`,
        args: { msg, user },
      });
    } catch (err) {
      console.error(err);
    }

    io.emit("broadcast", msg, res.lastInsertRowid.toString(), user);
  });

  socket.on("disconnect", () => {
    console.log("User disconnect");
  });
});

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/static/index.html");
});

app.use(express.json());
app.use("/public", express.static("./static"));

server.listen(PORT, () => {
  console.log(`Server runing in port ${PORT}`);
});

routerApi(app);
