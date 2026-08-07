import { LegalContent } from "../components/LegalContent";
import { Seo } from "../components/Seo";

export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <Seo
        title="Политика конфиденциальности и Условия — Celina"
        description="Политика конфиденциальности, условия использования и правила безопасности домашней еды на платформе Celina."
        path="/privacy"
        type="article"
      />
      <LegalContent />
    </div>
  );
}
