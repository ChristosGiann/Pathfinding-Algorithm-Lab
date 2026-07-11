import type { AppTexts } from "../../i18n/translations";
import "./AppHeader.css";

type AppHeaderProps = {
  texts: AppTexts["app"];
};

export function AppHeader({ texts }: AppHeaderProps) {
  return (
    <section className="app-header">
      <h1>{texts.title}</h1>
      <p>{texts.subtitle}</p>
    </section>
  );
}