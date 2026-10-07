const prisma = require("../lib/prisma");

const createQuotation = async (req, res) => {
  try {
    const { enquiryId, items, discount = 0 } = req.body;

    if (!enquiryId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Enquiry ID and at least one item are required",
      });
    }

    const enquiry = await prisma.customerEnquiry.findUnique({
      where: {
        id: Number(enquiryId),
      },
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    let subtotal = 0;
    let totalGst = 0;

    const quotationItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: {
          id: Number(item.productId),
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      const quantity = Number(item.quantity);

      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        });
      }

      const unitPrice = Number(product.unitPrice);
      const gstPercentage = Number(product.gstPercentage);

      const lineSubtotal = unitPrice * quantity;
      const lineGst = lineSubtotal * (gstPercentage / 100);

      subtotal += lineSubtotal;
      totalGst += lineGst;

      quotationItems.push({
        productId: product.id,
        quantity,
        unitPrice: product.unitPrice,
        lineTotal: lineSubtotal + lineGst,
      });
    }

    const discountAmount = Number(discount);

    if (discountAmount < 0 || discountAmount > subtotal) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount",
      });
    }

    const taxableAmount = subtotal - discountAmount;
    const gstAmount = totalGst;
    const totalAmount = taxableAmount + gstAmount;

    const quotation = await prisma.quotation.create({
      data: {
        enquiryId: Number(enquiryId),
        createdById: req.user.userId,
        discount: discountAmount,
        subtotal,
        gstAmount,
        totalAmount,
        items: {
          create: quotationItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        enquiry: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      quotation,
    });
  } catch (error) {
    console.error("Create quotation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create quotation",
    });
  }
};

const getQuotations = async (_req, res) => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        enquiry: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      quotations,
    });
  } catch (error) {
    console.error("Get quotations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
    });
  }
};

const updateQuotationStatus = async (req, res) => {
  try {
    const quotationId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      "DRAFT",
      "SENT",
      "ACCEPTED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quotation status",
      });
    }

    const quotation = await prisma.quotation.findUnique({
      where: {
        id: quotationId,
      },
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    const updatedQuotation = await prisma.quotation.update({
      where: {
        id: quotationId,
      },
      data: {
        status,
      },
    });

    return res.json({
      success: true,
      message: `Quotation marked as ${status}`,
      quotation: updatedQuotation,
    });
  } catch (error) {
    console.error("Update quotation status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update quotation status",
    });
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  updateQuotationStatus,
};