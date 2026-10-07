const prisma = require("../lib/prisma");

const createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      unitPrice,
      gstPercentage,
      physicalQty,
    } = req.body;

    if (!sku || !name || unitPrice === undefined || physicalQty === undefined) {
      return res.status(400).json({
        success: false,
        message: "SKU, name, unit price and physical quantity are required",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { sku: sku.trim() },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this SKU already exists",
      });
    }

    const product = await prisma.product.create({
      data: {
        sku: sku.trim(),
        name: name.trim(),
        unitPrice: unitPrice,
        gstPercentage: gstPercentage ?? 0,
        physicalQty: Number(physicalQty),
        reservedQty: 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: {
        ...product,
        availableQty: product.physicalQty - product.reservedQty,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

const getProducts = async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = products.map((product) => ({
      ...product,
      availableQty: product.physicalQty - product.reservedQty,
    }));

    return res.json({
      success: true,
      products: result,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
};