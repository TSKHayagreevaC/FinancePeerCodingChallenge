const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "entriesData.db");

const app = express();
app.use(express.json());
app.use(cors());

let db = null;

const data = require("./data");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server is running at https://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.post("/register/", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const getUserQuery = `SELECT * FROM members WHERE username LIKE '${username}';`;
  const dbUser = await db.get(getUserQuery);
  if (dbUser !== undefined) {
    res.status(400);
    res.json({
      message:
        "This Member Is Already Registered...Try With Different Username...",
    });
  } else {
    const dbAddMemberQuery = `
    INSERT INTO members(username, password) 
    VALUES ('${username}', '${hashedPassword}');`;
    await db.run(dbAddMemberQuery);
    res.status(200);
    res.json({
      message: "Your Registration Is Completed. Please Login Now...",
    });
  }
});

app.post("/login/", async (req, res) => {
  const { username, password } = req.body;
  const dbMemberQuery = `SELECT * FROM members WHERE username LIKE '${username}';`;
  const dbMember = await db.get(dbMemberQuery);

  if (dbMember === undefined) {
    res.status(400);
    res.json({ message: "Invalid Username..." });
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbMember.password);
    if (isPasswordMatched) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "secretToken");
      res.send({ jwtToken });
    } else {
      res.status(400);
      res.json({ message: "Incorrect Password..." });
    }
  }
});
