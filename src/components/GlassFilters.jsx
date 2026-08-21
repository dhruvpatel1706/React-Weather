/**
 * SVG filter definitions used by the glass material.
 *
 * `#glass-warp` is the important one: fed through `backdrop-filter: url(...)`
 * it displaces the pixels *behind* an element, so the sky genuinely bends as
 * it passes through the panel instead of merely blurring. The turbulence is
 * low-frequency and the displacement scale is small, which reads as thick
 * glass rather than as noise.
 *
 * Rendered once, hidden, at the app root.
 */
export default function GlassFilters() {
  return (
    <svg className="glass-filters" aria-hidden="true" focusable="false">
      <defs>
        <filter id="glass-warp" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.012"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="4" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Stronger warp for the edge lens ring. */}
        <filter id="glass-warp-edge" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.02"
            numOctaves="2"
            seed="3"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="26"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Volumetric bloom for the sun / god rays. */}
        <filter id="sun-bloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="18" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
