import { useQuery } from '@tanstack/react-query';

import { OrganizationRepositoryPort } from '@qwery/domain/repositories';
import {
  GetOrganizationService,
  GetOrganizationsService,
  GetOrganizationBySlugService,
} from '@qwery/domain/services';

export function useGetOrganizations(repository: OrganizationRepositoryPort) {
  const useCase = new GetOrganizationsService(repository);
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => useCase.execute(),
    staleTime: 30 * 1000,
  });
}

export function useGetOrganization(
  repository: OrganizationRepositoryPort,
  slug: string,
) {
  const useCase = new GetOrganizationBySlugService(repository);
  return useQuery({
    queryKey: ['organization', slug],
    queryFn: () => useCase.execute(slug),
    staleTime: 30 * 1000,
    enabled: !!slug,
  });
}

export function useGetOrganizationById(
  repository: OrganizationRepositoryPort,
  id: string,
) {
  const useCase = new GetOrganizationService(repository);
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => useCase.execute(id),
    staleTime: 30 * 1000,
    enabled: !!id,
  });
}
