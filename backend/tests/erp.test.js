require("dotenv").config();

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const prisma = require("../src/lib/prisma");

const created = {
  userIds: [],
  customerIds: [],
  productIds: [],
  enquiryIds: [],
  quotationIds: [],
  orderIds: [],
};

function tokenFor(userId, role = "SALES_USER") {
  return jwt.sign(
    {
      userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
}

async function createUser() {
  const user = await prisma.user.create({
    data: {
      name: `Test User ${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      passwordHash: "test-hash",
      role: "SALES_USER",
    },
  });

  created.userIds.push(user.id);
  return user;
}

async function createCustomer() {
  const customer = await prisma.customer.create({
    data: {
      name: `Test Customer ${Date.now()}`,
      email: `customer-${Date.now()}@example.com`,
      phone: "9999999999",
      address: "Bhubaneswar, Odisha",
    },
  });

  created.customerIds.push(customer.id);
  return customer;
}

async function createProduct(quantity = 100) {
  const product = await prisma.product.create({
    data: {
      sku: `TEST-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      name: "Test Product",
      description: "Automated test product",
      unitPrice: 1000,
      gstPercentage: 18,
      physicalQty: quantity,
      reservedQty: 0,
    },
  });

  created.productIds.push(product.id);
  return product;
}

async function createEnquiry(customerId, productId, quantity = 1) {
  const enquiry = await prisma.customerEnquiry.create({
    data: {
      customerId,
      subject: "Automated Test Enquiry",
      items: {
        create: {
          productId,
          quantity,
        },
      },
    },
  });

  created.enquiryIds.push(enquiry.id);
  return enquiry;
}

async function createAcceptedQuotation({
  userId,
  enquiryId,
  productId,
  quantity = 1,
}) {
  const quotation = await prisma.quotation.create({
    data: {
      enquiryId,
      createdById: userId,
      status: "ACCEPTED",
      discount: 0,
      subtotal: 1000 * quantity,
      gstAmount: 180 * quantity,
      totalAmount: 1180 * quantity,
      items: {
        create: {
          productId,
          quantity,
          unitPrice: 1000,
          lineTotal: 1180 * quantity,
        },
      },
    },
  });

  created.quotationIds.push(quotation.id);
  return quotation;
}

afterAll(async () => {
  // Delete test dispatches first
  if (created.orderIds.length > 0) {
    await prisma.dispatch.deleteMany({
      where: {
        salesOrderId: {
          in: created.orderIds,
        },
      },
    });
  }

  // Delete sales order items and sales orders
  if (created.orderIds.length > 0) {
    await prisma.salesOrderItem.deleteMany({
      where: {
        salesOrderId: {
          in: created.orderIds,
        },
      },
    });

    await prisma.salesOrder.deleteMany({
      where: {
        id: {
          in: created.orderIds,
        },
      },
    });
  }

  // Delete quotation items and quotations
  if (created.quotationIds.length > 0) {
    await prisma.quotationItem.deleteMany({
      where: {
        quotationId: {
          in: created.quotationIds,
        },
      },
    });

    await prisma.quotation.deleteMany({
      where: {
        id: {
          in: created.quotationIds,
        },
      },
    });
  }

  // Delete enquiry items and enquiries
  if (created.enquiryIds.length > 0) {
    await prisma.enquiryItem.deleteMany({
      where: {
        enquiryId: {
          in: created.enquiryIds,
        },
      },
    });

    await prisma.customerEnquiry.deleteMany({
      where: {
        id: {
          in: created.enquiryIds,
        },
      },
    });
  }

  // Delete customers/products/users
  if (created.customerIds.length > 0) {
    await prisma.customer.deleteMany({
      where: {
        id: {
          in: created.customerIds,
        },
      },
    });
  }

  if (created.productIds.length > 0) {
    await prisma.product.deleteMany({
      where: {
        id: {
          in: created.productIds,
        },
      },
    });
  }

  if (created.userIds.length > 0) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: created.userIds,
        },
      },
    });
  }

  await prisma.$disconnect();
});

describe("FundsWeb ERP API Tests", () => {
  test("1. Quotation calculation should calculate subtotal, GST and total correctly", async () => {
    const user = await createUser();
    const customer = await createCustomer();
    const product = await createProduct();
    const enquiry = await createEnquiry(customer.id, product.id, 5);

    const response = await request(app)
      .post("/api/quotations")
      .set("Authorization", `Bearer ${tokenFor(user.id)}`)
      .send({
        enquiryId: enquiry.id,
        items: [
          {
            productId: product.id,
            quantity: 5,
          },
        ],
        discount: 100,
      });

    expect(response.status).toBe(201);

    expect(Number(response.body.quotation.subtotal)).toBe(5000);
    expect(Number(response.body.quotation.gstAmount)).toBe(900);
    expect(Number(response.body.quotation.totalAmount)).toBe(5800);

    created.quotationIds.push(response.body.quotation.id);
  });

  test("2. Invalid quotation should not be converted to a sales order", async () => {
    const user = await createUser();
    const customer = await createCustomer();
    const product = await createProduct(100);
    const enquiry = await createEnquiry(customer.id, product.id, 2);

    const quotation = await prisma.quotation.create({
      data: {
        enquiryId: enquiry.id,
        createdById: user.id,
        status: "DRAFT",
        subtotal: 2000,
        gstAmount: 360,
        totalAmount: 2360,
        items: {
          create: {
            productId: product.id,
            quantity: 2,
            unitPrice: 1000,
            lineTotal: 2360,
          },
        },
      },
    });

    created.quotationIds.push(quotation.id);

    const response = await request(app)
      .post("/api/sales-orders")
      .set("Authorization", `Bearer ${tokenFor(user.id)}`)
      .send({
        quotationId: quotation.id,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/accepted quotations/i);
  });

  test("3. Duplicate sales order should be prevented", async () => {
    const user = await createUser();
    const customer = await createCustomer();
    const product = await createProduct(100);
    const enquiry = await createEnquiry(customer.id, product.id, 2);

    const quotation = await createAcceptedQuotation({
      userId: user.id,
      enquiryId: enquiry.id,
      productId: product.id,
      quantity: 2,
    });

    const firstResponse = await request(app)
      .post("/api/sales-orders")
      .set("Authorization", `Bearer ${tokenFor(user.id)}`)
      .send({
        quotationId: quotation.id,
      });

    expect(firstResponse.status).toBe(201);

    created.orderIds.push(firstResponse.body.order.id);

    const secondResponse = await request(app)
      .post("/api/sales-orders")
      .set("Authorization", `Bearer ${tokenFor(user.id)}`)
      .send({
        quotationId: quotation.id,
      });

    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.message).toMatch(/already exists/i);
  });

  test("4. Over-reservation should be prevented", async () => {
    const user = await createUser();
    const customer = await createCustomer();

    // Only 5 units available
    const product = await createProduct(5);

    const enquiry1 = await createEnquiry(customer.id, product.id, 4);

    const quotation1 = await createAcceptedQuotation({
      userId: user.id,
      enquiryId: enquiry1.id,
      productId: product.id,
      quantity: 4,
    });

    const firstResponse = await request(app)
      .post("/api/sales-orders")
      .set("Authorization", `Bearer ${tokenFor(user.id)}`)
      .send({
        quotationId: quotation1.id,
      });

    expect(firstResponse.status).toBe(201);
    created.orderIds.push(firstResponse.body.order.id);

    // Only 1 unit remains available, but this order needs 2
    const enquiry2 = await createEnquiry(customer.id, product.id, 2);

    const quotation2 = await createAcceptedQuotation({
      userId: user.id,
      enquiryId: enquiry2.id,
      productId: product.id,
      quantity: 2,
    });

    const secondResponse = await request(app)
      .post("/api/sales-orders")
      .set("Authorization", `Bearer ${tokenFor(user.id)}`)
      .send({
        quotationId: quotation2.id,
      });

    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.message).toMatch(/insufficient available inventory/i);

    const finalProduct = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });

    // Reservation must remain at 4, not become 6
    expect(finalProduct.reservedQty).toBe(4);
    expect(finalProduct.physicalQty).toBe(5);
  });

  test("5. Unauthorized operation should be rejected without authentication", async () => {
    const response = await request(app).get("/api/protected");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/authentication token is required/i);
  });
});