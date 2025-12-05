const prisma = require("../../utils/prisma");
const razorpay = require("../../config/razorpay");

exports.processStuckOrders = async () => {
  console.log("Running cleanup job for stuck orders...");
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const stuckOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: fifteenMinutesAgo },
    },
    include: { items: { include: { ticketType: true } } },
  });

  for (const order of stuckOrders) {
    try {
      if (!order.razorpayOrderId) {
        console.log(
          `[Cron] Order ${order.id} has no Razorpay ID. Marking FAILED and restoring stock.`
        );

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "FAILED" },
          });

          for (const item of order.items) {
            await tx.ticketType.update({
              where: { id: item.ticketTypeId },
              data: { quantity: { increment: item.quantity } },
            });
          }
        });
        continue;
      }
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

            const registrationPromises = order.items.flatMap((item) =>
              Array.from({ length: item.quantity }, () =>
                tx.eventRegistration.create({
                  data: {
                    orderId: order.id,
                    userId: order.userId,
                    eventId: item.ticketType.eventId,
                    ticketTypeId: item.ticketTypeId,
                  },
                })
              )
            );
            await Promise.all(registrationPromises);
          });
          console.log(
            `Order ${order.id} fully recovered and tickets generated.`
          );
        }
      } else if (
        rzOrder.status === "created" ||
        rzOrder.status === "attempted"
      ) {
        console.log(`Order ${order.id} was abandoned. Restoring stock.`);

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "FAILED" },
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
