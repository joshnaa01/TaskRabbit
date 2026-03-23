import express from 'express';
import { getServices, createService, updateService, deleteService, getServicesNearby } from '../controllers/service.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/nearby', getServicesNearby);

router.route('/')
  .get(getServices)
  .post(protect, authorize('provider', 'admin'), createService);

router.route('/:id')
  .put(protect, updateService)
  .delete(protect, deleteService);

export default router;
