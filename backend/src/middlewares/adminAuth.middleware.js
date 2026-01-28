import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Admin Authentication Middleware
 * 
 * This middleware should be used AFTER the verifyJWT middleware.
 * It checks if the authenticated user has admin role.
 * 
 * Usage:
 * router.get('/admin-route', verifyJWT, verifyAdmin, controller);
 */
export const verifyAdmin = asyncHandler(async (req, res, next) => {
    // Edge Case 1: No user object exists (JWT middleware not applied or failed silently)
    if (!req.user) {
        throw new ApiError(401, "Unauthorized: Authentication required. Please login first.");
    }

    // Edge Case 2: User object exists but is null/undefined after DB lookup
    if (req.user === null || req.user === undefined) {
        throw new ApiError(401, "Unauthorized: User session invalid. Please login again.");
    }

    // Edge Case 3: User object doesn't have a role property
    if (!('role' in req.user) || req.user.role === undefined) {
        throw new ApiError(500, "Internal Server Error: User role not defined.");
    }

    // Edge Case 4: Role is null or empty string
    if (req.user.role === null || req.user.role === '') {
        throw new ApiError(403, "Forbidden: User role is not assigned. Contact administrator.");
    }

    // Edge Case 5: Role value is not a valid string
    if (typeof req.user.role !== 'string') {
        throw new ApiError(500, "Internal Server Error: Invalid role format.");
    }

    // Edge Case 6: Role exists but is not 'admin' (case-insensitive check)
    const normalizedRole = req.user.role.toLowerCase().trim();
    if (normalizedRole !== 'admin') {
        throw new ApiError(403, "Forbidden: Admin access required. You do not have permission to access this resource.");
    }

    // Edge Case 7: Check if user account might be deactivated/suspended (if such field exists)
    if (req.user.isDeactivated === true || req.user.isSuspended === true) {
        throw new ApiError(403, "Forbidden: Your admin account has been deactivated or suspended.");
    }

    // Edge Case 8: Check if user's _id exists (valid MongoDB document)
    if (!req.user._id) {
        throw new ApiError(401, "Unauthorized: Invalid user session. Please login again.");
    }

    next();
});
