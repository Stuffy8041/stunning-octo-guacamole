export function unlockAllDistricts(profile, districtsData = []) {
  if (!profile) return profile;
  if (!Array.isArray(profile.districtProfiles)) profile.districtProfiles = [];
  const existing = new Set(profile.districtProfiles.map((d) => String(d.id)));
  for (const d of districtsData) {
    const id = d && d.id != null ? d.id : null;
    if (id == null) continue;
    if (!existing.has(String(id))) {
      profile.districtProfiles.push({
        id: id,
        isUnlocked: true,
        wasSeen: true
      });
    } else {
      const ex = profile.districtProfiles.find(
        (p) => String(p.id) === String(id)
      );
      if (ex) {
        ex.isUnlocked = true;
        ex.wasSeen = true;
      }
    }
  }
  return profile;
}

export function ensureSelectables(profile) {
  if (!profile) return profile;
  if (!Array.isArray(profile.surferProfiles)) profile.surferProfiles = [];
  if (!Array.isArray(profile.boardProfiles)) profile.boardProfiles = [];
  if (!Array.isArray(profile.surferSkinProfiles))
    profile.surferSkinProfiles = [];
  return profile;
}
