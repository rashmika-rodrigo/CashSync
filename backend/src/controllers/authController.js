import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";

// Register user
export async function registerUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required..!" });
    }

    const cleanUsername = username.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await sql`SELECT * FROM users WHERE username = ${cleanUsername}`;

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username is already taken..!" });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to database
    await sql`
      INSERT INTO users(username, password)
      VALUES (${cleanUsername}, ${hashedPassword})
    `;

    res.status(201).json({ message: "User registered successfully..", username: cleanUsername });
  } 
  catch (error) {
    console.log("Error registering user..!", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// Login user
export async function loginUser(req, res) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required..!" });
    }

    const cleanUsername = username.toLowerCase().trim();

    // Find the user in the database
    const users = await sql`SELECT * FROM users WHERE username = ${cleanUsername}`;
    if (users.length === 0) {
      return res.status(400).json({ message: "Account not found. Please sign up.." });
    }

    const user = users[0];

    // Compare entered password with hashed password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect password..!" });
    }
    res.status(200).json({ message: "Login successful..", username: user.username });
  } 
  catch (error) {
    console.log("Error logging in..!", error);
    res.status(500).json({ message: "Internal server error" });
  }
}