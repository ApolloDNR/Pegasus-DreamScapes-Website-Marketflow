import React from 'react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {render,screen,cleanup} from '@testing-library/react';
import {afterEach,describe,it,expect,vi} from 'vitest';
const state=vi.hoisted(()=>({payload:{} as any}));
vi.mock('@/lib/queryClient',()=>({authenticatedRequest:async()=>({ok:true,json:async()=>state.payload}),apiRequest:vi.fn(),queryClient:{invalidateQueries:vi.fn()}}));
import AdminHqOutbox from '@/pages/admin-hq-outbox';
afterEach(cleanup);
const renderPage=()=>render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}})}><AdminHqOutbox/></QueryClientProvider>);
describe('website delivery admin truth',()=>{
 it('shows configuration without claiming live health or recipient delivery',async()=>{state.payload={rows:[],transportConfigured:true,legacyRequiresReview:true};renderPage();expect(await screen.findByText('Connection configured')).toBeInTheDocument();expect(screen.queryByText('Live')).not.toBeInTheDocument();});
 it('shows quarantined context and does not offer automatic retry',async()=>{state.payload={transportConfigured:false,legacyRequiresReview:true,rows:[{id:'a7000000-0000-4000-8000-000000000003',surface:'lead',status:'quarantined',attempts:1,createdAt:'2026-10-02T00:00:00Z',lastError:'invalid_receipt',payload:{submission:{kind:'lead',captured:{firstName:'Synthetic',lastName:'Visitor',email:'synthetic@example.test'},consent:{contact:false,privacyAcknowledged:false}}}}]};renderPage();expect(await screen.findByText('Synthetic Visitor')).toBeInTheDocument();expect(screen.getByText('quarantined')).toBeInTheDocument();expect(screen.queryByTestId('button-retry-a7000000-0000-4000-8000-000000000003')).not.toBeInTheDocument();});
});
