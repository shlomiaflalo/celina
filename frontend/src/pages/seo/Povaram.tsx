import { LandingPage } from "./LandingPage";
import { POVARAM_PAGE } from "../../data/landingPages";

/** /povaram — единственный лендинг сайта, написанный для ПОВАРА, а не для покупателя. */
export function Povaram() {
  return <LandingPage data={POVARAM_PAGE} />;
}
