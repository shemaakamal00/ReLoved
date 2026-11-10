// Hjälpfunktioner för att slippa att varje route skriva if (error)

export async function unwrap(query, description = "Databasfråga") {
  const { data, error } = await query;
  if (error) throw new Error(`${description}: ${error.message}`);
  return data;
}

export async function countRows(query, description = "Räkna rader") {
  const { count, error } = await query;
  if (error) throw new Error(`${description}: ${error.message}`);
  return count ?? 0;
}
