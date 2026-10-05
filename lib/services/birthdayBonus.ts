import dbConnect from '../dbConnect';
import UserModel from '../models/UserModel';
import SiteSettingsModel from '../models/SiteSettingsModel';
import { getTier } from '../loyalty';

/**
 * Awards birthday bonus points to all users whose birthday is today.
 * Skips users who have already received a birthday bonus this calendar year.
 * The bonus amount is read from SiteSettings.birthdayBonusPoints.
 */
export async function awardBirthdayBonuses(): Promise<{ awarded: number; skipped: number }> {
  await dbConnect();

  // Get birthday bonus amount from site settings
  let settings = await SiteSettingsModel.findOne().lean();
  if (!settings) {
    settings = await SiteSettingsModel.create({});
  }
  const bonusPoints = (settings as any).birthdayBonusPoints ?? 100;
  if (bonusPoints <= 0) return { awarded: 0, skipped: 0 };

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();

  // Find all users who have a dateOfBirth set
  const users = await UserModel.find({
    dateOfBirth: { $exists: true, $ne: null },
  });

  let awarded = 0;
  let skipped = 0;

  for (const user of users) {
    const dob = new Date(user.dateOfBirth);
    if (isNaN(dob.getTime())) {
      skipped++;
      continue;
    }

    const dobMonth = dob.getMonth() + 1;
    const dobDay = dob.getDate();

    // Check if today is their birthday
    if (dobMonth !== currentMonth || dobDay !== currentDay) {
      continue;
    }

    // Check if already awarded this year
    const history = (user as any).loyaltyHistory || [];
    const alreadyAwarded = history.some((h: any) => {
      if (!h.description?.includes('Birthday bonus')) return false;
      const hDate = new Date(h.date);
      return hDate.getFullYear() === currentYear;
    });

    if (alreadyAwarded) {
      skipped++;
      continue;
    }

    // Award the points
    user.loyaltyPoints = (user.loyaltyPoints || 0) + bonusPoints;
    user.loyaltyHistory.push({
      type: 'earn',
      points: bonusPoints,
      description: `Birthday bonus (${currentYear})`,
      date: new Date(),
    });
    user.loyaltyTier = getTier(user.loyaltyPoints);
    await user.save();
    awarded++;
  }

  return { awarded, skipped };
}
