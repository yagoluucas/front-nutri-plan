export function getNameInitials(name: string, fallback = "NP") {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  const firstInitial = nameParts[0]?.[0] ?? "";
  const lastInitial =
    nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] ?? "" : "";
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();

  return initials || fallback;
}
