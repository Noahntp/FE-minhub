const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/credits/balance/:instructorId
router.get('/balance/:instructorId', async (req, res) => {
  try {
    let creditBalance = await prisma.instructorCourseCredit.findUnique({
      where: { instructor_id: req.params.instructorId }
    });

    if (!creditBalance) {
      // Return 0 balance if not found
      return res.json({
        total_credits: 0,
        used_credits: 0,
        remaining_credits: 0
      });
    }

    res.json(creditBalance);
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/credits/transactions/:instructorId
router.get('/transactions/:instructorId', async (req, res) => {
  try {
    const transactions = await prisma.instructorCreditTransaction.findMany({
      where: { instructor_id: req.params.instructorId },
      orderBy: { created_at: 'desc' },
      include: {
        order: {
          select: {
            order_code: true,
            package_snapshot_name: true,
            amount: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      }
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/credits/orders/:instructorId
router.get('/orders/:instructorId', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        user_id: req.params.instructorId,
        order_type: 'instructor_credit'
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/credits/admin/orders
// Lấy danh sách các order package cho Admin dashboard
router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        order_type: 'instructor_credit'
      },
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
