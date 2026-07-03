const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/packages
router.get('/', async (req, res) => {
  try {
    const packages = await prisma.courseCreditPackage.findMany({
      where: {
        status: 'active',
        deleted_at: null
      },
      orderBy: {
        sort_order: 'asc'
      }
    });
    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/packages/:id
router.get('/:id', async (req, res) => {
  try {
    const pkg = await prisma.courseCreditPackage.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!pkg || pkg.deleted_at || pkg.status !== 'active') {
      return res.status(404).json({ message: 'Package not found or inactive' });
    }
    
    res.json(pkg);
  } catch (error) {
    console.error('Error fetching package details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
