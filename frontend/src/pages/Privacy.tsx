import { LegalContent } from "../components/LegalContent";
import { useLang } from "../i18n";
import { Seo } from "../components/Seo";

export function Privacy() {
  const { lang } = useLang();
  return (
    <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <Seo
        title={lang === "en" ? "Privacy Policy and Terms — Celina" : "Политика конфиденциальности и Условия — Celina"}
        description={lang === "en" ? "Privacy policy, terms of use and food-safety rules of the Celina platform." : "Политика конфиденциальности, условия использования и правила безопасности домашней еды на платформе Celina."}
        path="/privacy"
        type="article"
      />
      <LegalContent />
    </div>
  );
}
