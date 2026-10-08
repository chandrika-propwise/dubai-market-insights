/** Original locked artwork from page 17 of the supplied Propwise Brand Book.
 * The SVG viewport selects its existing blue-on-navy lockup without retyping or altering it.
 */
export function BrandLogo() {
  return (
    <svg
      className="propwise-logo"
      role="img"
      aria-label="Propwise"
      viewBox="120 735 350 120"
      preserveAspectRatio="xMidYMid meet"
    >
      <image href="/brand/logo-variants.jpeg" width="2000" height="1125" />
    </svg>
  );
}
