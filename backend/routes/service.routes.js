import express from 'express';
import { getServices, createService, updateService, deleteService, getServicesNearby } from '../controllers/service.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/nearby', getServicesNearby);

// Add auth middleware to new route
router.get('/my', protect, authorize('provider'), async (req, res) => {
  try {
    const Service = (await import('../models/Service.js')).default;
    const services = await Service.find({ providerId: req.user.id })
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.route('/')
  .get(getServices)
  .post(protect, authorize('provider', 'admin'), createService);

router.route('/:id')
  .get(async (req, res) => {
    try {
      const service = await (await import('../models/Service.js')).default.findById(req.params.id)
        .populate('providerId', 'name profilePicture bio location')
        .populate('categoryId', 'name icon');
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.status(200).json({ success: true, data: service });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
  .put(protect, authorize('provider', 'admin'), updateService)
  .delete(protect, authorize('provider', 'admin'), deleteService);

export default router;
