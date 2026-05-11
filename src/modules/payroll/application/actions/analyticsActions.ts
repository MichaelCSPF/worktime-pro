'use server';

import { createClient } from '@/shared/infrastructure/supabase/server';
import { GetAnalyticsUseCase } from '../GetAnalyticsUseCase';
import { SupabaseTimeEntryRepository } from '@/modules/time-tracking/infrastructure/SupabaseTimeEntryRepository';

const timeRepo = new SupabaseTimeEntryRepository();
const getAnalyticsUseCase = new GetAnalyticsUseCase(timeRepo);

export async function getAnalyticsAction(month: number, year: number, companyId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const result = await getAnalyticsUseCase.execute({
    userId: user.id,
    month,
    year,
    companyId
  });

  if (result.isFailure()) return null;

  return result.getValue();
}
