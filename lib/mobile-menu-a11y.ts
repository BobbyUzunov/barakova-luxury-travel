export function getMobileMenuInertAttribute(
  isMenuOpen: boolean,
): true | undefined {
  return !isMenuOpen ? true : undefined;
}
