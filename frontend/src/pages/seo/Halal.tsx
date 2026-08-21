import { LandingPage } from "./LandingPage";
import { HALAL_PAGE } from "../../data/landingPages";

/** /halal — SEO-лендинг «Халяльная домашняя еда на заказ». */
export function Halal() {
  return <LandingPage data={HALAL_PAGE} />;
}
