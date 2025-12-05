const prisma = require("../../utils/prisma");
const razorpay = require("../../config/razorpay");
const BookingService = require("../Events/BookingService");

exports.processStuckOrders = async () => {
  console.log("Running cleanup job for stuck orders...");
  const tenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const stuckOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: tenMinutesAgo },
    },
    include: { items: true },
  });

  for (const order of stuckOrders) {
    try {
      const rzOrder = await razorpay.orders.fetch(order.razorpayOrderId);

      if (rzOrder.status === "paid") {
        console.log(`Order ${order.id} was paid but stuck. Completing now.`);
        const payments = await razorpay.orders.fetchPayments(
          order.razorpayOrderId
        );
        const successPayment = payments.items.find(
          (p) => p.status === "captured"
        );
        if (successPayment) {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: "COMPLETED",
                razorpayPaymentId: successPayment.id,
              },
            });
          });
        }
      } else if (
        rzOrder.status === "created" ||
        rzOrder.status === "attempted"
      ) {
        console.log(`Order ${order.id} was abandoned. Restoring stock.`);

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" },
          });

          for (const item of order.items) {
            await tx.ticketType.update({
              where: { id: item.ticketTypeId },
              data: { quantity: { increment: item.quantity } },
            });
          }
        });
      }
    } catch (error) {
      console.error(`Failed to process stuck order ${order.id}:`, error);
    }
  }
};
