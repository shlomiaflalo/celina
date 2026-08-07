import { LandingPage } from "./LandingPage";
import { ZAGOTOVKI_PAGE } from "../../data/landingPages";

/** /zagotovki — SEO-лендинг «Домашние заготовки на заказ: соленья, квашеное, варенье». */
export function Zagotovki() {
  return <LandingPage data={ZAGOTOVKI_PAGE} />;
}
