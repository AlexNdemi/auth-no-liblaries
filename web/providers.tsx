"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, createTRPCClient } from '@trpc/client';
import React, { useState } from 'react';
import { TRPCProvider } from '@/lib/trpc';
import { AppRouter } from '@/trpc/server/routers/_app';
import superjson from 'superjson'


export default function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
          transformer:superjson,
        }),
      ],
    }),
  );

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TRPCProvider>
  );
}
