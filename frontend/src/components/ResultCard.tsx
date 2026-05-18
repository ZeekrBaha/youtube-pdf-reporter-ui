import type { AnalyzeResponse } from "../types";

type Props = {
  data: AnalyzeResponse;
  onReset: () => void;
};

export function ResultCard({ data, onReset }: Props) {
  return (
    <section className="card" aria-label="result">
      <h2>Summary</h2>
      <p>{data.summary}</p>

      <h2>Main topics</h2>
      {data.main_topics.length === 0 ? (
        <p>None.</p>
      ) : (
        <ul>
          {data.main_topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      )}

      <a className="button-link" href={data.pdf_url} download={data.pdf_filename}>
        Download PDF
      </a>

      <div style={{ marginTop: 16 }}>
        <button type="button" className="button-secondary" onClick={onReset}>
          Analyze another
        </button>
      </div>
    </section>
  );
}
