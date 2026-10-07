const express = require("express");
const cors = require("cors");
const prisma = require("./lib/prisma"); 
const app=express();
app.use(cors());
app.use(express.json());
app.get("/api/db-test",async (_req,res)=>{
    try{
         const result = await prisma.$queryRaw`SELECT NOW()`;

    res.json({
      success: true,
      message: "Database connected successfully",
      time: result[0],
    });
    }
    catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.get("/api/health",(_req,res)=>{
    res.json(
        {
        success:true,
        message:"Fundsweb ERP Backend is Running",
        }
    );
});
module.exports=app;
