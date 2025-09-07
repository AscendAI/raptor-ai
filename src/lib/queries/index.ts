import {
  QueryClient,
} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
