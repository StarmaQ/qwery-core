import { useQuery } from '@tanstack/react-query';

import { ProjectRepositoryPort } from '@qwery/domain/repositories';
import {
  GetProjectBySlugService,
  GetProjectService,
  GetProjectsService,
} from '@qwery/domain/services';

export function useGetProjects(repository: ProjectRepositoryPort) {
  const useCase = new GetProjectsService(repository);
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => useCase.execute(),
    staleTime: 30 * 1000,
  });
}

export function useGetProjectById(
  repository: ProjectRepositoryPort,
  id: string,
) {
  const useCase = new GetProjectService(repository);
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => useCase.execute(id),
    staleTime: 30 * 1000,
  });
}

export function useGetProjectBySlug(
  repository: ProjectRepositoryPort,
  slug: string,
) {
  const useCase = new GetProjectBySlugService(repository);
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => useCase.execute(slug),
    staleTime: 30 * 1000,
  });
}
