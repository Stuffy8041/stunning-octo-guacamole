export function ensureSelectables(profile) {
  if (!profile) return profile;
  if (!Array.isArray(profile.surferProfiles)) profile.surferProfiles = [];
  if (!Array.isArray(profile.boardProfiles)) profile.boardProfiles = [];
  if (!Array.isArray(profile.surferSkinProfiles))
    profile.surferSkinProfiles = [];
  return profile;
}
