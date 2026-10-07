const prisma = require("../lib/prisma");

const createEnquiry = async (req, res) => {
  try {
const { customerId, subject } = req.body;

    if (!customerId || !subject) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and subject are required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: Number(customerId) },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

   const enquiry = await prisma.customerEnquiry.create({
  data: {
    customerId: Number(customerId),
    subject: subject.trim(),
  },
  include: {
    customer: true,
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