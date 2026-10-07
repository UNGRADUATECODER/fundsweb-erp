const prisma = require("../lib/prisma");

const createDispatch = async (req, res) => {
  try {
    const { salesOrderId } = req.body;

    if (!salesOrderId) {
      return res.status(400).json({
        success: false,
        message: "Sales order ID is required",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: {
          id: Number(salesOrderId),
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.status === "DISPATCHED") {
        throw new Error("ALREADY_DISPATCHED");
      }

      for (const item of order.items) {
        const updated = await tx.$queryRaw`
          UPDATE "Product"
          SET "physicalQty" = "physicalQty" - ${item.quantity},
              "reservedQty" = "reservedQty" - ${item.quantity},
              "updatedAt" = NOW()
          WHERE "id" = ${item.productId}
            AND "reservedQty" >= ${item.quantity}
            AND "physicalQty" >= ${item.quantity}
          RETURNING "id"
        `;

        if (updated.length === 0) {
          throw new Error("INVALID_INVENTORY");
        }
      }

      await tx.salesOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: "DISPATCHED",
        },
      });

      const dispatch = await tx.dispatch.create({
        data: {
          salesOrderId: order.id,
          status: "DISPATCHED",
          dispatchedAt: new Date(),
        },
      });

      return dispatch;
    });

    return res.status(201).json({
      success: true,
      message: "Order dispatched successfully",
      dispatch: result,
    });
  } catch (error) {
    console.error("Dispatch error:", error);

    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    if (error.message === "ALREADY_DISPATCHED") {
      return res.status(409).json({
        success: false,
        message: "Sales order is already dispatched",
      });
    }

    if (error.message === "INVALID_INVENTORY") {
      return res.status(409).json({
        success: false,
        message: "Reserved inventory is not available",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to dispatch order",
    });
  }
};

const getDispatches = async (_req, res) => {
  try {
    const dispatches = await prisma.dispatch.findMany({
      include: {
        salesOrder: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      dispatches,
    });
  } catch (error) {
    console.error("Get dispatches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dispatches",
    });
  }
};

module.exports = {
  createDispatch,
  getDispatches,
};