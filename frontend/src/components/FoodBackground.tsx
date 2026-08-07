/**
 * Фон левой части входа: русские пельмени под фирменным
 * оранжевым градиентом (~50%). Сверху — пуш-уведомления и текст.
 */
export function FoodBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src="/images/pelmeni.jpg"
        alt=""
        className="h-full w-full object-cover"
        style={{ transform: "scale(1.06)", objectPosition: "50% 50%" }}
      />
      {/* фирменный оранжевый градиент (~50% прозрачности) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(244,160,31,0.48) 0%, rgba(224,134,12,0.55) 100%)",
        }}
      />
      {/* лёгкое затемнение снизу — чтобы белый текст читался */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
    </div>
  );
}
