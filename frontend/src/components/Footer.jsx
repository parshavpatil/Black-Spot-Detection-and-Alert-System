import React from "react";

function Footer() {
  return (
    <footer className="mt-12 fade-in" style={{background: "var(--clr-surface)", borderTop: "1px solid color-mix(in oklab, var(--clr-charcoal) 15%, white)"}}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold mb-2" style={{color: "var(--clr-charcoal)"}}>Blackspot</div>
            <p style={{color: "color-mix(in oklab, var(--clr-charcoal) 70%, white)"}}>Making roads safer by reporting hazardous locations.</p>
          </div>
          <div>
            <div className="font-semibold mb-2" style={{color: "var(--clr-charcoal)"}}>Contact</div>
            <ul className="space-y-1" style={{color: "color-mix(in oklab, var(--clr-charcoal) 70%, white)"}}>
              <li>Email: <a className="underline" href="mailto:support@blackspot.example" style={{color: "var(--clr-primary)"}}>support@blackspot.example</a></li>
              <li>Phone: <a className="underline" href="tel:+10000000000" style={{color: "var(--clr-primary)"}}>+1 000 000 0000</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2" style={{color: "var(--clr-charcoal)"}}>Follow us</div>
            <div className="flex items-center gap-3" style={{color: "var(--clr-charcoal)"}}>
              <a href="#" aria-label="Twitter" className="transition-colors hover:underline">🐦</a>
              <a href="#" aria-label="Facebook" className="transition-colors hover:underline">📘</a>
              <a href="#" aria-label="Instagram" className="transition-colors hover:underline">📸</a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-xs flex items-center justify-between" style={{color: "color-mix(in oklab, var(--clr-charcoal) 60%, white)"}}>
          <span>&copy; {new Date().getFullYear()} Blackspot. All rights reserved.</span>
          <span>Built with care.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


