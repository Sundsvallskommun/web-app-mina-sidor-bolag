import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAppContext } from '@contexts/app.context';
import { AgreementData, PagedAgreementsResponse } from '@interfaces/agreement';
import { handlePagedAgreementsResponse } from '@services/agreement-service';
import { apiService, ApiResponse, handleError, useApiService } from '@services/api-service';

const mergeAgreements = (pages: PagedAgreementsResponse[]): AgreementData => {
  const merged: AgreementData = {};
  for (const page of pages) {
    const refined = handlePagedAgreementsResponse(page.agreements);
    for (const address in refined) {
      merged[address] = [...(merged[address] ?? []), ...refined[address]];
    }
  }
  return merged;
};

export function usePagedAgreements(pageLimit: number, includeInactive: boolean = false) {
  const queryClient = useApiService((s) => s.queryClient);
  const { representingMode } = useAppContext();
  const path = includeInactive ? '/paged/all-agreements' : '/paged/agreements';

  const { data, error, isFetching, hasNextPage, fetchNextPage } = useInfiniteQuery(
    {
      queryKey: ['paged-agreements', representingMode, path, pageLimit],
      queryFn: async ({ pageParam, signal }) => {
        const res = await apiService.get<ApiResponse<PagedAgreementsResponse>>(
          `${path}?page=${pageParam}&limit=${pageLimit}`,
          { signal }
        );
        return res.data.data;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) =>
        pages.length < (lastPage._meta?.totalPages ?? 1) ? pages.length + 1 : undefined,
      throwOnError: (e) => {
        handleError(e as AxiosError);
        return false;
      },
    },
    queryClient
  );

  useEffect(() => {
    if (hasNextPage && !isFetching && !error) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetching, error, fetchNextPage]);

  const pages = data?.pages;
  const agreements = useMemo(() => mergeAgreements(pages ?? []), [pages]);
  const isDone = !isFetching && (!hasNextPage || !!error);

  return {
    agreements,
    isFetching: !isDone,
    isDone,
    currentPage: pages?.length ?? 0,
    totalPages: pages?.[pages.length - 1]?._meta?.totalPages ?? 0,
    error: error ?? null,
  };
}
