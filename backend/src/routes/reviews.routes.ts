import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { asyncHandler } from "../middleware/error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const reviewsRouter = Router();

async function recalcRating(cookProfileId: string) {
  const agg = await prisma.review.aggregate({
    where: { cookProfileId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.cookProfile.update({
    where: { id: cookProfileId },
    data: { rating: agg._avg.rating ?? 0, ratingsCount: agg._count },
  });
}

const schema = z.object({
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// POST /api/reviews — оценка после доставленного заказа
reviewsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { orderId, rating, comment } = schema.parse(req.body);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== req.user!.userId) {
      return res.status(404).json({ error: "Заказ не найден" });
    }
    if (order.status !== "DELIVERED") {
      return res.status(400).json({ error: "Оценить можно только доставленный заказ" });
    }

    // на один заказ — один отзыв: повторная попытка должна дать понятную 409, а не 500
    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) {
      return res.status(409).json({ error: "Вы уже оценили этот заказ" });
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        buyerId: order.buyerId,
        cookProfileId: order.cookProfileId,
        rating,
        comment,
      },
    });

    await recalcRating(order.cookProfileId);
    res.status(201).json({ review });
  })
);

// DELETE /api/reviews/:id — повар может удалить отзыв со своей страницы
reviewsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("COOK"),
  asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: { cookProfile: { select: { userId: true } } },
    });
    if (!review) return res.status(404).json({ error: "Отзыв не найден" });
    if (review.cookProfile.userId !== req.user!.userId) {
      return res.status(403).json({ error: "Можно удалять только отзывы о своей кухне" });
    }
    await prisma.review.delete({ where: { id: review.id } });
    await recalcRating(review.cookProfileId);
    res.status(204).end();
  })
);

export default reviewsRouter;
