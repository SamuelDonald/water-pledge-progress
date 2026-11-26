import { useState } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";

const locations = [
  { name: "Dallas–Fort Worth", region: "North Texas", x: 63, y: 23, note: "A major North Texas hub for residential transactions." },
  { name: "Greater Houston", region: "Gulf Coast", x: 74, y: 59, note: "Serving the greater Houston metropolitan area." },
  { name: "Greater Austin", region: "Central Texas", x: 47, y: 51, note: "Central Texas coverage, including the Austin region." },
  { name: "Greater San Antonio", region: "South Central Texas", x: 43, y: 66, note: "Residential transaction coordination in the San Antonio region." },
  { name: "Rio Grande Valley", region: "South Texas", x: 47, y: 91, note: "Coverage planning extends to communities in the Rio Grande Valley." },
  { name: "El Paso", region: "West Texas", x: 8, y: 50, note: "West Texas is included in the planned service footprint." },
  { name: "Corpus Christi", region: "Coastal Bend", x: 62, y: 75, note: "Coastal Bend communities are part of the coverage plan." },
  { name: "Central & West Texas", region: "Regional", x: 29, y: 39, note: "Additional Central and West Texas communities can be considered." },
];

export function TexasCoverageScene() {
  const [selected, setSelected] = useState(0);
  const active = locations[selected];
  return (
    <section className="texas-coverage-scene">
      <div className="texas-map-panel">
        <div className="texas-map-heading"><span>LC / SERVICE FOOTPRINT</span><span>01—08</span></div>
        <div className="texas-map-art" role="group" aria-label="Select a Texas coverage region">
          <svg className="texas-outline" viewBox="0 0 340 390" role="img" aria-label="Stylized outline of Texas">
            <defs><linearGradient id="texasFill" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#d8c6a2" stopOpacity=".25"/><stop offset="100%" stopColor="#d8c6a2" stopOpacity=".04"/></linearGradient></defs>
            <path d="M45 34 L167 40 L170 71 L192 74 L192 100 L218 101 L218 135 L245 143 L257 169 L280 190 L264 212 L253 240 L236 260 L222 286 L205 313 L192 343 L178 356 L166 334 L151 313 L143 286 L130 269 L119 245 L104 229 L93 205 L79 185 L65 158 L60 128 L53 105 L48 75 Z" fill="url(#texasFill)" stroke="#b99d6b" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M47 75 L167 82 M60 128 L192 134 M79 185 L245 190 M104 229 L236 260 M143 286 L205 313" fill="none" stroke="#b99d6b" strokeOpacity=".28" strokeDasharray="3 5"/>
            <path d="M166 40 L170 71 L192 74 L192 100 L218 101 L218 135 L245 143" fill="none" stroke="#b99d6b" strokeOpacity=".45"/>
          </svg>
          {locations.map((location, index) => (
            <button key={location.name} type="button" className={`texas-pin ${selected === index ? "selected" : ""}`} style={{ left: `${location.x}%`, top: `${location.y}%` }} onClick={() => setSelected(index)} aria-label={`Select ${location.name}`} aria-pressed={selected === index}>
              <span className="pin-pulse" /><span className="pin-dot" /><span className="pin-label">{location.name}</span>
            </button>
          ))}
          <span className="texas-map-north">N</span>
          <span className="texas-map-scale">TEXAS / USA</span>
        </div>
        <div className="texas-map-foot"><span>ILLUSTRATIVE COVERAGE MAP</span><span>NOT A PROPERTY MAP</span></div>
      </div>
      <aside className="texas-region-card">
        <p className="eyebrow">Selected region</p>
        <span className="texas-region-number">0{selected + 1}</span>
        <p className="texas-region-type">{active.region}</p>
        <h3>{active.name}</h3>
        <p className="texas-region-description">{active.note}</p>
        <div className="texas-region-list">
          {locations.map((location, index) => <button key={location.name} type="button" className={selected === index ? "active" : ""} onClick={() => setSelected(index)}><span>0{index + 1}</span>{location.name}<ArrowUpRight size={13} /></button>)}
        </div>
        <p className="texas-disclaimer"><MapPin size={13} /> Featured regions are planning references, not a guarantee of service availability for a specific transaction.</p>
      </aside>
    </section>
  );
}
