import { useCallback, useEffect, useState } from 'react';
import { AgreementData, PagedAgreementsResponse } from '@interfaces/agreement';
import { handlePagedAgreementsResponse } from '@services/agreement-service';
import { apiService, ApiResponse } from '@services/api-service';

export function usePagedAgreements(pageLimit: number) {
  const [agreements, setAgreements] = useState<AgreementData>({});
  const [isFetching, setIsFetching] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const mergeAgreements = useCallback((incoming: AgreementData, prev: AgreementData): AgreementData => {
    const merged = { ...prev };
    for (const address in incoming) {
      merged[address] = [...(merged[address] ?? []), ...incoming[address]];
    }
    return merged;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchPages = async () => {
      let totalPages = 1;

      try {
        for (let page = 1; page <= totalPages && !cancelled; page++) {
          const res = await apiService.get<ApiResponse<PagedAgreementsResponse>>(
            `/paged/agreements?page=${page}&limit=${pageLimit}`
          );

          const pageData = res.data.data;
          const refined = handlePagedAgreementsResponse(pageData.agreements);

          setAgreements((prev) => mergeAgreements(refined, prev));
          setCurrentPage(page);

          totalPages = pageData._meta?.totalPages ?? 1;
          setTotalPages(totalPages);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to fetch agreements page'));
        }
      }

      if (!cancelled) {
        setIsFetching(false);
        setIsDone(true);
      }
    };

    fetchPages();

    return () => {
      cancelled = true;
    };
  }, [mergeAgreements, pageLimit]);

  return { agreements, isFetching, isDone, currentPage, totalPages, error };
}
