import { LandingPage } from "./LandingPage";
import { DOSTAVKA_PAGE } from "../../data/landingPages";

/** /dostavka — SEO-лендинг «Доставка домашней еды на дом». */
export function Dostavka() {
  return <LandingPage data={DOSTAVKA_PAGE} />;
}
