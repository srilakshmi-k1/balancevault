const { submitOnboarding, getOnboardingStatus, listOnboardings, reviewOnboarding } = require('../services/onboardingService');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

function getRequestContext(req) {
  return { requestId: req.requestId, ipAddress: req.ip, userAgent: req.headers['user-agent'] };
}

async function submit(req, res, next) {
  try {
    const onboarding = await submitOnboarding(req.user.id, req.body, getRequestContext(req));
    return successResponse(res, onboarding, 'Onboarding submitted successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const onboarding = await getOnboardingStatus(req.user.id);
    return successResponse(res, onboarding, 'Onboarding status retrieved');
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const result = await listOnboardings({ status, page: Number(page), limit: Number(limit) });
    return paginatedResponse(res, result.records, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (err) {
    next(err);
  }
}

async function review(req, res, next) {
  try {
    const updated = await reviewOnboarding(req.params.id, req.user.id, req.body, getRequestContext(req));
    return successResponse(res, updated, 'Onboarding reviewed successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { submit, getStatus, list, review };
