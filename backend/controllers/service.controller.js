import Service from '../models/Service.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

export const getServices = async (req, res) => {
  try {
    const { keyword, category, providerId, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    // Build query
    let query = { isActive: true };

    if (providerId && providerId !== 'undefined') {
      query.providerId = providerId;
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (category) {
      query.categoryId = category;
    }

    if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const services = await Service.find(query)
      .populate('categoryId', 'name icon')
      .populate('providerId', 'name profilePicture')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      pages: Math.ceil(total / limit),
      data: services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    // Force providerId from JWT
    const serviceData = { ...req.body, providerId: req.user.id };
    const service = await Service.create(serviceData);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    // Ensure the provider owns this service (or is admin)
    if (service.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service' });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    if (service.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this service' });
    }

    service.isActive = false;
    await service.save();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getServicesNearby = async (req, res) => {
  try {
    const { lat, lng, radius, category, minPrice, maxPrice, keyword, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 1. Validation
    if (!lat || !lng) {
      return res.status(200).json({ success: true, data: [], total: 0 }); // Fallback for no location
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // 2. Radius Constraints (1km - 20000km)
    let searchRadiusKm = parseFloat(radius);
    if (!searchRadiusKm || searchRadiusKm < 1) searchRadiusKm = 10;
    if (searchRadiusKm > 20000) searchRadiusKm = 20000;

    const radiusInMeters = searchRadiusKm * 1000;

    // 3. Aggregate - Find Providers Near User
    const providers = await User.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          maxDistance: radiusInMeters,
          spherical: true,
          query: { role: 'provider', isApproved: true, status: 'active' }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: 'providerId',
          as: 'providerServices'
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'providerId',
          as: 'providerReviews'
        }
      },
      {
        $addFields: {
          calcRating: { $ifNull: [{ $avg: '$providerReviews.rating' }, 0] },
          calcReviewCount: { $size: '$providerReviews' }
        }
      },
      { $unwind: '$providerServices' },
      {
        $match: {
          'providerServices.isActive': true,
          ...(category && { 'providerServices.categoryId': new mongoose.Types.ObjectId(category) }),
          ...(((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) && {
            'providerServices.price': {
              ...(minPrice !== undefined && minPrice !== '' && { $gte: Number(minPrice) }),
              ...(maxPrice !== undefined && maxPrice !== '' && { $lte: Number(maxPrice) })
            }
          }),
          ...(keyword && {
            $or: [
              { 'name': { $regex: keyword, $options: 'i' } },
              { 'providerServices.title': { $regex: keyword, $options: 'i' } },
              { 'providerServices.description': { $regex: keyword, $options: 'i' } }
            ]
          })
        }
      },
      {
        $project: {
          _id: '$providerServices._id',
          title: '$providerServices.title',
          price: '$providerServices.price',
          description: '$providerServices.description',
          images: '$providerServices.images',
          serviceType: '$providerServices.serviceType',
          categoryId: '$providerServices.categoryId',
          distance: { $round: [{ $divide: ['$distance', 1000] }, 1] }, // Convert to km, 1 decimal
          provider: {
            id: '$_id',
            name: '$name',
            profilePicture: '$profilePicture',
            location: '$location',
            rating: { $round: ['$calcRating', 1] },
            reviewCount: '$calcReviewCount'
          }
        }
      },
      { $sort: { distance: 1 } }
    ]);

    // Include Remote Services (Always show, ignore distance)
    let remoteQuery = { serviceType: 'remote', isActive: true };
    if (category) remoteQuery.categoryId = category;
    if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
      remoteQuery.price = {};
      if (minPrice !== undefined && minPrice !== '') remoteQuery.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') remoteQuery.price.$lte = Number(maxPrice);
    }
    if (keyword) {
      remoteQuery.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    const remoteResults = await Service.find(remoteQuery)
      .populate('providerId', 'name profilePicture location')
      .lean();

    // Fetch reviews for remote providers to maintain consistency
    const providerIds = remoteResults.map(s => s.providerId?._id).filter(Boolean);
    const remoteReviews = await mongoose.model('Review').aggregate([
      { $match: { providerId: { $in: providerIds } } },
      { $group: { _id: '$providerId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const reviewMap = {};
    remoteReviews.forEach(r => { reviewMap[r._id.toString()] = r; });

    const formattedRemote = remoteResults.map(s => ({
      _id: s._id,
      title: s.title,
      price: s.price,
      description: s.description,
      images: s.images,
      serviceType: s.serviceType,
      categoryId: s.categoryId,
      distance: null,
      provider: {
        id: s.providerId?._id,
        name: s.providerId?.name,
        profilePicture: s.providerId?.profilePicture,
        location: s.providerId?.location,
        rating: reviewMap[s.providerId?._id?.toString()]?.avgRating ? Math.round(reviewMap[s.providerId?._id?.toString()].avgRating * 10) / 10 : 0,
        reviewCount: reviewMap[s.providerId?._id?.toString()]?.count || 0
      }
    }));

    // Merge and de-duplicate
    const combined = [...providers, ...formattedRemote];
    const uniqueIds = new Set();
    const deDuplicated = combined.filter(item => {
      const idStr = item._id.toString();
      if (uniqueIds.has(idStr)) return false;
      uniqueIds.add(idStr);
      return true;
    });

    const sortedResults = deDuplicated.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    // Manual Pagination of the sorted results
    const total = sortedResults.length;
    const paginatedResults = sortedResults.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: paginatedResults
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
