export function toTitle(slug: string): string {
  return slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export function toComponentName(slug: string): string {
  return (
    slug
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('') + 'Lab'
  );
}
