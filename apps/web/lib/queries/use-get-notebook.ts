import { useQuery } from '@tanstack/react-query';

import { NotebookRepositoryPort } from '@qwery/domain/repositories';
import {
  GetNotebookBySlugService,
  GetNotebooksByProjectIdService,
  GetNotebookService,
} from '@qwery/domain/services';

export function getNotebookKey(key: string) {
  return ['notebook', key];
}

export function getNotebooksKey() {
  return ['notebooks'];
}

export function getNotebooksByProjectIdKey(projectId: string) {
  return ['notebooks', 'project', projectId];
}

export function useGetNotebooksByProjectId(
  repository: NotebookRepositoryPort,
  projectId: string | undefined,
) {
  const useCase = new GetNotebooksByProjectIdService(repository);
  return useQuery({
    queryKey: getNotebooksByProjectIdKey(projectId || ''),
    queryFn: () => useCase.execute(projectId || ''),
    staleTime: 30 * 1000,
    enabled: !!projectId,
  });
}

export function useGetNotebook(
  repository: NotebookRepositoryPort,
  slug: string,
) {
  const useCase = new GetNotebookBySlugService(repository);
  return useQuery({
    queryKey: getNotebookKey(slug),
    queryFn: () => useCase.execute(slug),
    staleTime: 30 * 1000,
    enabled: !!slug,
  });
}

export function useGetNotebookById(
  repository: NotebookRepositoryPort,
  id: string,
) {
  const useCase = new GetNotebookService(repository);
  return useQuery({
    queryKey: getNotebookKey(id),
    queryFn: () => useCase.execute(id),
    staleTime: 30 * 1000,
    enabled: !!id,
  });
}
