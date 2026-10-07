const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const register= async (req,res) =>{
    try{
        const { name,email,password } = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"Name,email and password are required",
            });
        }
        if(password.length < 6){
             return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await prisma.user.findUnique({
            where: {email:normalizedEmail},
        })

        if(existingUser){
            return res.status(409).json({
                  success: false,
        message: "User with this email already exists",
            });
        }

        const passwordHash=await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data:{
                name:name.trim(),
            email :normalizedEmail,
            passwordHash,
            role:"SALES_USER",
    },
});


return res.status(201).json({
success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
});
    }
    catch(error){
console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
    }
};

const login = async (req,res) =>{
    try{
        const { email,password}= req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Email and password is required",
            });

        }

        const normalizedEmail = email.trim().toLowerCase();
          const user=await prisma.user.findUnique({
            where:{
                 email:normalizedEmail
            },
          });
          if(!user){
            return res.status(401).json({
                 success: false,
        message: "Invalid email or password",
            });
          }

          const passwordValid=await bcrypt.compare(
            password,user.passwordHash
          );
           if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }

};


module.exports = {
  register,
  login,
};