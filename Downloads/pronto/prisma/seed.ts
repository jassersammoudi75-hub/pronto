import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
const img = (s: string) => `https://picsum.photos/seed/${encodeURIComponent(s)}/600/400`;

async function main() {
  await db.orderItem.deleteMany(); await db.delivery.deleteMany(); await db.order.deleteMany();
  await db.product.deleteMany(); await db.store.deleteMany(); await db.user.deleteMany();
  const password = await bcrypt.hash("password123", 10);
  const mk = (name: string, email: string, phone: string, role: Role, approved = true) =>
    db.user.create({ data: { name, email, phone, password, role, approved } });
  await mk("أدمن PRONTO", "admin@pronto.test", "+10000000001", "ADMIN");
  await mk("سارة العميلة", "customer@pronto.test", "+10000000002", "CUSTOMER");
  const m = await mk("محمود التاجر", "merchant@pronto.test", "+10000000003", "MERCHANT");
  await mk("خالد المندوب", "courier@pronto.test", "+10000000004", "COURIER");
  const m2 = await mk("تاجر قيد المراجعة", "merchant2@pronto.test", "+10000000005", "MERCHANT", false);
  await mk("مندوب قيد المراجعة", "courier2@pronto.test", "+10000000006", "COURIER", false);

  const data: { owner: string; name: string; category: string; items: [string, number][] }[] = [
    { owner: m.id, name: "برجر الفارس", category: "مطاعم", items: [["برجر كلاسيك", 850], ["برجر دجاج", 790], ["بطاطس مقرمشة", 300], ["مشروب غازي", 150]] },
    { owner: m.id, name: "سوبرماركت الخير", category: "بقالة", items: [["حليب 1 لتر", 180], ["خبز طازج", 100], ["بيض (12)", 320], ["أرز 2 كجم", 450]] },
    { owner: m2.id, name: "حلويات الأمل", category: "حلويات", items: [["كنافة", 600], ["بقلاوة", 700]] },
  ];
  for (const s of data)
    await db.store.create({
      data: {
        name: s.name, category: s.category, image: img(s.name), lat: 30.05, lng: 31.23, ownerId: s.owner,
        products: { create: s.items.map(([name, price]) => ({ name, price, image: img(name) })) },
      },
    });
  console.log("Seeded. Password: password123 | OTP: 123456");
}
main().finally(() => db.$disconnect());
