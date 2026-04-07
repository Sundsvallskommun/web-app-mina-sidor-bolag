import { useCallback, useEffect, useRef, useState } from 'react';
import { AgreementData, PagedAgreementsResponse } from '@interfaces/agreement';
import { handlePagedAgreementsResponse } from '@services/agreement-service';
import { apiService, ApiResponse } from '@services/api-service';

export function usePagedAgreements(pageLimit: number) {
  const [agreements, setAgreements] = useState<AgreementData>({});
  const [isFetching, setIsFetching] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const mergeAgreements = useCallback((incoming: AgreementData, prev: AgreementData): AgreementData => {
    const merged = { ...prev };
    for (const address in incoming) {
      merged[address] = [...(merged[address] ?? []), ...incoming[address]];
    }
    return merged;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchPages = async () => {
      let page = 1;
      let totalPages = 1;

      try {
        while (page <= totalPages && !controller.signal.aborted) {
          const res = await apiService.get<ApiResponse<PagedAgreementsResponse>>(
            `/paged/agreements?page=${page}&limit=${pageLimit}`,
            { signal: controller.signal }
          );

          const pageData = res.data.data;
          const refined = handlePagedAgreementsResponse(pageData.agreements);

          setAgreements((prev) => mergeAgreements(refined, prev));
          setCurrentPage(page);

          totalPages = pageData._meta?.totalPages ?? 1;
          page++;
        }
      } catch {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch agreements page');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsFetching(false);
          setIsDone(true);
        }
      }
    };

    fetchPages();

    return () => {
      controller.abort();
    };
  }, [mergeAgreements]);

  return { agreements, isFetching, isDone, currentPage };
}
