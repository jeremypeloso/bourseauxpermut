/** Institutions ouvertes à l'inscription. NEXT_PUBLIC_INSTITUTIONS="PN" puis "PN,GN,AP" quand les autres arrivent. */
export const OUVERTES: string[] = (process.env.NEXT_PUBLIC_INSTITUTIONS || 'PN').split(',').map(s => s.trim()).filter(Boolean);
export const estOuverte = (code: string) => OUVERTES.includes(code);
export const LIBELLES: Record<string, string> = { PN: 'Police nationale', GN: 'Gendarmerie nationale', AP: 'Administration pénitentiaire' };
