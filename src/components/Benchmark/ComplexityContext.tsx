import { complexityTexts } from "../../i18n/complexity";
import type { Algorithm } from "../../types/algorithm";
import type { Language } from "../../i18n/translations";
import { translations } from "../../i18n/translations";

export function ComplexityContext({ slug, catalogue, language }: { slug: string; catalogue: Algorithm[]; language: Language }) {
  const algorithm = catalogue.find(item => item.slug === slug);
  const t = translations[language].algorithmLibrary;
  const labels = complexityTexts[language];
  return <details><summary>{labels.title}</summary>{algorithm ? <dl>
    {([[t.bestCase, algorithm.best_case_complexity], [t.averageCase, algorithm.average_case_complexity], [t.worstCase, algorithm.worst_case_complexity], [t.spaceComplexity, algorithm.space_complexity]]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || labels.missing}</dd></div>)}
  </dl> : <p>{labels.missing}</p>}<p>{labels.note}</p></details>;
}
