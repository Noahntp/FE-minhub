const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// POST /api/payments/create-order
// Body: { userId, packageId, couponCode? }
router.post('/create-order', async (req, res) => {
  try {
    const { userId, packageId, couponCode } = req.body;

    // Validate user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'instructor' || user.status !== 'active') {
      return res.status(403).json({ message: 'Invalid or unauthorized user.' });
    }

    // Validate package
    const pkg = await prisma.courseCreditPackage.findUnique({ where: { id: packageId } });
    if (!pkg || pkg.status !== 'active' || pkg.deleted_at) {
      return res.status(404).json({ message: 'Package not found or inactive.' });
    }

    // Handle coupon (simplified logic for prototype)
    let amount = pkg.price;
    let coupon = null;
    
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.status === 'active') {
        if (coupon.discount_type === 'percent') {
          amount = Math.max(0, pkg.price - (pkg.price * coupon.discount_value / 100));
        } else {
          amount = Math.max(0, pkg.price - coupon.discount_value);
        }
        // In real app: validate dates, usage_limit, max_order_amount, etc.
      }
    }

    const orderCode = 'PKG-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    // Create Order
    const order = await prisma.order.create({
      data: {
        order_type: 'instructor_credit',
        credit_package_id: pkg.id,
        package_snapshot_name: pkg.name,
        package_snapshot_credits: pkg.credits,
        user_id: user.id,
        order_code: orderCode,
        status: 'pending',
        price_snapshot: pkg.price,
        amount: amount,
        payment_status: 'unpaid',
        coupon_id: coupon ? coupon.id : null,
      }
    });

    res.json({ success: true, order });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /api/payments/confirm
// Simulates a webhook or frontend confirmation of payment
router.post('/confirm', async (req, res) => {
  try {
    const { orderCode, paymentMethod, providerTransactionId } = req.body;

    // We must use a transaction to prevent double credits
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock and find order
      const order = await tx.order.findUnique({
        where: { order_code: orderCode }
      });

      if (!order) {
        throw new Error('Order not found');
      }
      
      if (order.status === 'paid' || order.payment_status === 'paid') {
        throw new Error('Order already paid');
      }

      // 2. Find or create instructor credit balance
      let creditBalance = await tx.instructorCourseCredit.findUnique({
        where: { instructor_id: order.user_id }
      });

      if (!creditBalance) {
        creditBalance = await tx.instructorCourseCredit.create({
          data: {
            instructor_id: order.user_id,
            total_credits: 0,
            used_credits: 0,
            remaining_credits: 0
          }
        });
      }

      const balanceBefore = creditBalance.remaining_credits;
      const creditsToAdd = order.package_snapshot_credits || 0;
      const balanceAfter = balanceBefore + creditsToAdd;

      // 3. Update order status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          payment_status: 'paid',
          payment_method: paymentMethod || 'mock',
          provider_transaction_id: providerTransactionId || ('TXN-' + Date.now()),
          paid_at: new Date()
        }
      });

      // 4. Update instructor credit
      await tx.instructorCourseCredit.update({
        where: { id: creditBalance.id },
        data: {
          total_credits: creditBalance.total_credits + creditsToAdd,
          remaining_credits: balanceAfter
        }
      });

      // 5. Create transaction history
      await tx.instructorCreditTransaction.create({
        data: {
          instructor_id: order.user_id,
          order_id: order.id,
          type: 'purchase',
          credits: creditsToAdd,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          note: `Purchased package: ${order.package_snapshot_name}`
        }
      });

      // Update coupon used count if any
      if (order.coupon_id) {
         await tx.coupon.update({
            where: { id: order.coupon_id },
            data: { used_count: { increment: 1 } }
         });
      }

      return updatedOrder;
    });

    res.json({ success: true, order: result });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
