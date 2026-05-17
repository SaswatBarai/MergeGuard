import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';

const router: Router = Router();

router.post('/', ReviewController.createReview);
router.get('/', ReviewController.listReviews);
router.get('/:id', ReviewController.getReview);
router.get('/:id/stream', ReviewController.streamReview);
router.post('/:id/cancel', ReviewController.cancelReview);
router.post('/:id/feedback', ReviewController.submitFeedback);

export default router;
