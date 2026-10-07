const prisma = require("../lib/prisma");

const createSalesOrder = async (req, res) => {
  try {
    const { quotationId } = req.body;

    if (!quotationId) {
      return res.status(400).json({
        success: false,
        message: "Quotation ID is required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findUnique({
        where: {
          id: Number(quotationId),
        },
        include: {
          items: true,
          enquiry: true,
        },
      });

      if (!quotation) {
        throw new Error("QUOTATION_NOT_FOUND");
      }

      if (quotation.status !== "ACCEPTED") {
        throw new Error("QUOTATION_NOT_ACCEPTED");
      }

      const existingOrder = await tx.salesOrder.findUnique({
        where: {
          quotationId: Number(quotationId),
        },
      });

      if (existingOrder) {
        throw new Error("ORDER_ALREADY_EXISTS");
      }

      // Reserve inventory atomically.
      for (const item of quotation.items) {
        const updated = await tx.$queryRaw`
          UPDATE "Product"
          SET "reservedQty" = "reservedQty" + ${item.quantity},
              "updatedAt" = NOW()
          WHERE "id" = ${item.productId}
            AND ("physicalQty" - "reservedQty") >= ${item.quantity}
          RETURNING "id"
        `;

        if (updated.length === 0) {
          throw new Error(`INSUFFICIENT_STOCK_${item.productId}`);
        }
      }

      const order = await tx.salesOrder.create({
        data: {
          quotationId: quotation.id,
          customerId: quotation.enquiry.customerId,
          createdById: req.user.userId,
          totalAmount: quotation.totalAmount,
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          quotation: true,
        },
      });

      return order;
    });

    return res.status(201).json({
      success: true,
      message: "Sales order created and inventory reserved successfully",
      order: result,
    });
  } catch (error) {
    console.error("Create sales order error:", error);

    if (error.message === "QUOTATION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    if (error.message === "QUOTATION_NOT_ACCEPTED") {
      return res.status(400).json({
        success: false,
        message: "Only accepted quotations can be converted to sales orders",
      });
    }

    if (error.message === "ORDER_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Sales order already exists for this quotation",
      });
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK_")) {
      return res.status(409).json({
        success: false,
        message: "Insufficient available inventory",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create sales order",
    });
  }
};

const getSalesOrders = async (_req, res) => {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        customer: true,
        quotation: true,
        items: {
          include: {
            product: true,
          },
        },
        dispatches: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get sales orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales orders",
    });
  }
};

module.exports = {
  createSalesOrder,
  getSalesOrders,
};