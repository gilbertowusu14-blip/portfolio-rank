import { useState } from "react";

type Holding = {
  ticker: string;
  weight: number;
  type: "stock" | "etf" | "crypto" | "cash";
};

function App() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { ticker: "", weight: 0, type: "stock" },
  ]);

  const [risk, setRisk] = useState<"conservative" | "balanced" | "aggressive">(
    "balanced"
  );
  const [horizon, setHorizon] = useState<"0-3" | "3-7" | "7+">("3-7");
  const [score, setScore] = useState<number | null>(null);

  const addHolding = () => {
    setHoldings([...holdings, { ticker: "", weight: 0, type: "stock" }]);
  };

  function calculateScore() {
    const weights = holdings.map((h) => Number(h.weight || 0));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    if (totalWeight === 0) {
      setScore(1);
      return;
    }

    // 1) Diversification (number of holdings)
    const diversificationScore = Math.min(10, holdings.length * 2);

    // 2) Concentration (largest holding penalty)
    const maxWeight = Math.max(...weights);

const etfWeights = holdings
  .filter((h) => h.type === "etf")
  .map((h) => Number(h.weight || 0));
const maxEtfWeight = etfWeights.length ? Math.max(...etfWeights) : 0;

const stockWeights = holdings
  .filter((h) => h.type === "stock")
  .map((h) => Number(h.weight || 0));
const maxStockWeight = stockWeights.length ? Math.max(...stockWeights) : 0;

// ETFs are allowed to be bigger without getting nuked
let concentrationScore = 10;
concentrationScore -= maxStockWeight / 10;      // harsher penalty
concentrationScore -= maxEtfWeight / 25;        // softer penalty
concentrationScore = Math.max(1, concentrationScore);


    // 3) Evenness (placeholder)
    const evenness = 10 - (Math.max(...weights) - Math.min(...weights)) / 10;
    const sectorBalanceScore = Math.max(1, evenness);

    // 4) Risk alignment (basic logic)
    let riskScore = 5;
    if (risk === "aggressive" && maxWeight > 40) riskScore = 8;
    if (risk === "conservative" && maxWeight > 40) riskScore = 3;
    if (risk === "balanced") riskScore = 6;

    const finalScore =
      (diversificationScore + concentrationScore + sectorBalanceScore + riskScore) /
      4;

    setScore(Number(finalScore.toFixed(1)));
  }

  const updateHolding = (
    index: number,
    field: "ticker" | "weight" | "type",
    value: string
  ) => {
    const updated = [...holdings];

    if (field === "weight") {
      updated[index].weight = Number(value);
    } else if (field === "ticker") {
      updated[index].ticker = value.toUpperCase();
    } else {
      updated[index].type = value as Holding["type"];
    }

    setHoldings(updated);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Portfolio Rank</h1>

      <h2>Enter Your Portfolio</h2>

      {holdings.map((holding, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <input
            placeholder="Ticker (e.g. AAPL)"
            value={holding.ticker}
            onChange={(e) => updateHolding(index, "ticker", e.target.value)}
            style={{ marginRight: "10px" }}
          />

          <input
            type="number"
            placeholder="% Allocation"
            value={holding.weight}
            onChange={(e) => updateHolding(index, "weight", e.target.value)}
          />

          <select
            value={holding.type}
            onChange={(e) => updateHolding(index, "type", e.target.value)}
            style={{ marginLeft: "10px" }}
          >
            <option value="stock">Stock</option>
            <option value="etf">ETF</option>
            <option value="crypto">Crypto</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      ))}

      <div style={{ marginTop: "20px" }}>
        <h3>Risk Tolerance</h3>
        <select value={risk} onChange={(e) => setRisk(e.target.value as any)}>
          <option value="conservative">Conservative</option>
          <option value="balanced">Balanced</option>
          <option value="aggressive">Aggressive</option>
        </select>

        <h3 style={{ marginTop: "16px" }}>Time Horizon</h3>
        <select value={horizon} onChange={(e) => setHorizon(e.target.value as any)}>
          <option value="0-3">0–3 years</option>
          <option value="3-7">3–7 years</option>
          <option value="7+">7+ years</option>
        </select>
      </div>

      <button onClick={addHolding}>Add Holding</button>

      <button onClick={calculateScore} style={{ marginLeft: "10px" }}>
        Calculate Score
      </button>

      {score !== null && (
        <div style={{ marginTop: "20px" }}>
          <h2>Your Portfolio Score: {score} / 10</h2>
        </div>
      )}
    </div>
  );
}

export default App;
