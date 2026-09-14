const User = require("../models/user");
const bcrypt =require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUND = 10;

// Registration logs the user in right away and blocks duplicate emails
async function registration(req,res){
    const {name,email,password}= req.body;

    if(!name || !email || !password){
        return res.status(400).json({error: "Name, email and password are required"});
    }

    try{
        const existingEmail= await User.findOne({email: email.toLowerCase()}); // lowercased here too so the lookup stays case-insensitive, schema only lowercases on save
        if(existingEmail){
            return res.status(409).json({error: "user already exist"});
        }

        const password_hash =await bcrypt.hash(password,SALT_ROUND);
        const newUser=await User.create({
            name,
            email: email.toLowerCase(),
            password_hash,
        });

        const token= tokenGenerator(newUser);

        res.status(201).json({
            token,
            user:{
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    }catch(error){
        console.error("registration error", error.message);
        res.status(500).json({error:"Error during registration process"});
    }
}
// Verifies email,password against the stored user and returns a login token if they match
async function login (req,res){
    const { email, password }= req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "wrong email or password" });
    }
    const correctPassword = await bcrypt.compare(password, user.password_hash);
    if (!correctPassword) {
      return res.status(401).json({ error: "wrong email or password" });
    }

    const token= tokenGenerator(user);

    res.json({
        token,
        user:{
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "login error" });
  }

}

// The token carries only id and role and expires after 7 days
function tokenGenerator(user){
    return jwt.sign(
    { id: user._id, role: user.role},
    process.env.JWT_SECRET,
    {expiresIn:"7d"}
    );
}

module.exports= {registration,login};
