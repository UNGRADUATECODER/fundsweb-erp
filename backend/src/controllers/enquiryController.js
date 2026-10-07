const prisma = require("../lib/prisma");

const createEnquiry = async (req, res) => {
  try {
    const { customerId, subject, items } = req.body;

    if (!customerId || !subject) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and subject are required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one enquiry item is required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: Number(customerId),
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const enquiryItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid productId and quantity greater than 0",
        });
      }

      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${productId} not found`,
        });
      }

      enquiryItems.push({
        productId,
        quantity,
      });
    }

    const enquiry = await prisma.customerEnquiry.create({
      data: {
        customerId: Number(customerId),
        subject: subject.trim(),
        items: {
          create: enquiryItems,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Enquiry created successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Create enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create enquiry",
    });
  }
};

const getEnquiries = async (_req, res) => {
  try {
    const enquiries = await prisma.customerEnquiry.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      enquiries,
    });
  } catch (error) {
    console.error("Get enquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
    });
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
};