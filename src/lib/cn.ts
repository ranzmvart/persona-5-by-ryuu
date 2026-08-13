/** Gabungkan class CSS bersyarat, tanpa library eksternal. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
