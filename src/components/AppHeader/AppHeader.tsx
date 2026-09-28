import type { AppTexts, Language } from "../../i18n/translations";
import "./AppHeader.css";

type AppHeaderProps = {
  texts: AppTexts["app"];
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export function AppHeader({ texts, language, onLanguageChange }: AppHeaderProps) {
  return (
    <section className="app-header">
      <h1>{texts.title}</h1>
      <p>{texts.subtitle}</p>
      <label className="app-header__language" htmlFor="app-language">{texts.language}
        <select id="app-language" value={language} onChange={event => {
          const selected = event.target.value;
          if (selected === "el" || selected === "en") onLanguageChange(selected);
        }}>
          <option value="el" lang="el">{texts.greek}</option>
          <option value="en" lang="en">{texts.english}</option>
        </select>
      </label>
    </section>
  );
}