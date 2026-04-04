const { body } = require('express-validator');
const LocalService = require('../models/LocalService');
const { haversineDistance } = require('../utils/haversine');

// @desc    Get all local services
// @route   GET /api/local
exports.getLocalServices = async (req, res, next) => {
  try {
    const { type, rating, search, page, limit, sortBy, order } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (rating) filter.rating = { $gte: parseFloat(rating) };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
    ];

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const total = await LocalService.countDocuments(filter);

    const services = await LocalService.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((p - 1) * l)
      .limit(l);

    return res.json({
      success: true,
      data: services,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new local service (admin or verified student)
// @route   POST /api/local
exports.createLocalService = async (req, res, next) => {
  try {
    const {
      name, type, description, address, cost, facilities,
      contactNumber, latitude, longitude, photos,
    } = req.body;

    const service = await LocalService.create({
      name,
      type,
      description,
      address,
      cost,
      facilities: facilities ? (Array.isArray(facilities) ? facilities : facilities.split(',')) : [],
      contactNumber,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
      },
      photos: photos || [],
      postedBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Service added.', data: service });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single local service
// @route   GET /api/local/:id
exports.getLocalService = async (req, res, next) => {
  try {
    const service = await LocalService.findById(req.params.id).populate('reviews.user', 'name profilePhoto');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    return res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// @desc    Update local service
// @route   PUT /api/local/:id
exports.updateLocalService = async (req, res, next) => {
  try {
    const service = await LocalService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });

    if (service.postedBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { name, type, description, address, cost, facilities, contactNumber, latitude, longitude } = req.body;
    Object.assign(service, { name, type, description, address, cost, contactNumber });
    if (facilities) service.facilities = Array.isArray(facilities) ? facilities : facilities.split(',');
    if (latitude && longitude) {
      service.location = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
    }

    await service.save();
    return res.json({ success: true, message: 'Service updated.', data: service });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete local service
// @route   DELETE /api/local/:id
exports.deleteLocalService = async (req, res, next) => {
  try {
    const service = await LocalService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });

    if (service.postedBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await service.deleteOne();
    return res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review / rating
// @route   POST /api/local/:id/review
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const service = await LocalService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });

    // Avoid duplicate reviews
    const alreadyReviewed = service.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(409).json({ success: false, message: 'You already reviewed this service.' });
    }

    service.reviews.push({ user: req.user._id, rating, comment });

    // Recalculate average rating
    const totalRating = service.reviews.reduce((sum, r) => sum + r.rating, 0);
    service.rating = parseFloat((totalRating / service.reviews.length).toFixed(1));

    await service.save();
    return res.json({ success: true, message: 'Review added.', data: service });
  } catch (err) {
    next(err);
  }
};

// @desc    Get services by proximity (Haversine)
// @route   GET /api/local/nearby
exports.getNearbyServices = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng are required.' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    const filter = {};
    if (type) filter.type = type;

    const allServices = await LocalService.find(filter).lean();

    const nearby = allServices.filter((s) => {
      const [sLng, sLat] = s.location.coordinates;
      const dist = haversineDistance(userLat, userLng, sLat, sLng);
      s.distanceKm = parseFloat(dist.toFixed(2));
      return dist <= radiusKm;
    });

    nearby.sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json({ success: true, data: nearby });
  } catch (err) {
    next(err);
  }
};

exports.localValidation = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('type').isIn(['hostel', 'mess', 'pg', 'hardware', 'stationery', 'other']).withMessage('Invalid type.'),
  body('address').notEmpty().withMessage('Address is required.'),
];
