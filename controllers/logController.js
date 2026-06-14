const asyncHandler = require('express-async-handler');
const Log = require('../models/LogModel');

// GET /api/log
// Query params : startDate, endDate, userId, method, resource, q (search), page, limit
exports.getLogs = asyncHandler(async (req, res) => {
    const {
        startDate,
        endDate,
        userId,
        method,
        resource,
        q,
        page = 1,
        limit = 100,
    } = req.query;

    const filter = {};
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) {
            const d = new Date(endDate);
            d.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = d;
        }
    }
    if (userId) filter.userId = userId;
    if (method) filter.method = method;
    if (resource) filter.resource = resource;
    if (q) {
        filter.$or = [
            { path: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { userNom: { $regex: q, $options: 'i' } },
            { userPrenom: { $regex: q, $options: 'i' } },
        ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
        Log.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Log.countDocuments(filter),
    ]);

    res.json({
        success: true,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        data: items,
    });
});

// DELETE /api/log/purge?olderThanDays=90
// Supprime les logs plus vieux que N jours (defaut 90). Reserve admin.
exports.purgeLogs = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.olderThanDays || '90', 10);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const r = await Log.deleteMany({ createdAt: { $lt: cutoff } });
    res.json({ success: true, deletedCount: r.deletedCount });
});
