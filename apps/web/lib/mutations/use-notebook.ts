import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Notebook } from '@qwery/domain/entities';
import { NotebookRepositoryPort } from '@qwery/domain/repositories';
import {
  getNotebookKey,
  getNotebooksByProjectIdKey,
} from '../queries/use-get-notebook';

export function useNotebook(
  notebookRepository: NotebookRepositoryPort,
  onSuccess: (notebook: Notebook) => void,
  onError: (error: Error) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notebook: Notebook) => {
      // Check if notebook exists by trying to find it
      try {
        await notebookRepository.findById(notebook.id);
        // If found, update it
        return await notebookRepository.update(notebook);
      } catch {
        // If not found, create it
        return await notebookRepository.create(notebook);
      }
    },
    onSuccess: (notebook: Notebook) => {
      queryClient.invalidateQueries({
        queryKey: getNotebookKey(notebook.slug),
      });
      queryClient.invalidateQueries({
        queryKey: getNotebooksByProjectIdKey(notebook.projectId),
      });
      onSuccess(notebook);
    },
    onError,
  });
}
