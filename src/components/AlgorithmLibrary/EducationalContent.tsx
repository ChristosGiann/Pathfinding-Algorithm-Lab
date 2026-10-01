import type { Algorithm } from "../../types/algorithm";
import type { Language } from "../../i18n/translations";
import { educationTexts } from "../../i18n/education";

export function EducationalContent({algorithm,language}:{algorithm:Algorithm;language:Language}) {
  const t=educationTexts[language], content=algorithm.education?.[language], metadata=algorithm.education;
  if (!content || !metadata) return <p>{t.missing}</p>;
  return <details><summary>{t.title}</summary><p>{t.theory}</p>
    {(["what","intuition","strengths","weaknesses","uses","pitfalls"] as const).map(key=>content[key] && <div key={key}><h4>{t[key]}</h4><p>{content[key]}</p></div>)}
    {content.how?.length ? <><h4>{t.how}</h4><ol>{content.how.map((step,index)=><li key={index}>{step}</li>)}</ol></> : null}
    <dl>{(["stable","in_place"] as const).map(key=><div key={key}><dt>{key==='stable'?t.stable:t.inPlace}</dt><dd>{metadata[key] == null ? "—" : metadata[key] ? t.yes : t.no}</dd></div>)}</dl>
    {metadata.walkthrough?.length ? <><h4>{t.example}</h4><ol>{metadata.walkthrough.map((values,index)=><li key={index}><code>[{values.join(", ")}]</code></li>)}</ol></> : null}
  </details>;
}
