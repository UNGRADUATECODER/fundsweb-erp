const express = require("express");
const cors = require("cors");
const prisma = require("./lib/prisma");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const productRoutes = require("./routes/productRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const salesOrderRoutes = require("./routes/salesOrderRoutes");
const {
  authenticate,
  authorizeRoles,
} = require("./middlewares/authMiddleware");


const dispatchRoutes = require("./routes/dispatchRoutes");




const app=express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/dispatches", dispatchRoutes);

app.use("/api/sales-orders", salesOrderRoutes);

app.get(
  "/api/protected",
  authenticate,
  (req, res) => {
    res.json({
      success: true,
      message: "Protected route accessed successfully",
      user: req.user,
    });
  }
);
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
