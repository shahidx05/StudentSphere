const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, changeRole, deleteUser,
  getResources, deleteResource,
  getMarketplace, deleteMarketplaceItem,
  getActivity,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// All admin routes require auth + admin role
router.use(protect, isAdmin);

router.get('/stats',              getStats);
router.get('/activity',           getActivity);
router.get('/users',              getUsers);
router.patch('/users/:id/role',   changeRole);
router.delete('/users/:id',       deleteUser);
router.get('/resources',          getResources);
router.delete('/resources/:id',   deleteResource);
router.get('/marketplace',        getMarketplace);
router.delete('/marketplace/:id', deleteMarketplaceItem);

module.exports = router;
