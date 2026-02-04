import express from "express";
import { eq } from "drizzle-orm";
import { db, pool } from "./db/db.js";

const app = express();
const PORT = 8000;

app.use(express.json());

// GET all users
app.get("/users", async (req, res) => {
  try {
    const users = await db.select().from(demoUsers);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single user
app.get("/users/:id", async (req, res) => {
  try {
    const user = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.id, parseInt(req.params.id)));
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name, email })
      .returning();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user
app.put("/users/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name, email })
      .where(eq(demoUsers.id, parseInt(req.params.id)))
      .returning();
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE user
app.delete("/users/:id", async (req, res) => {
  try {
    await db.delete(demoUsers).where(eq(demoUsers.id, parseInt(req.params.id)));
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running! Try /users for CRUD operations" });
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing pool and server...");
  await pool.end();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
