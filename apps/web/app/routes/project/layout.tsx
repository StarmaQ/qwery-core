import { Outlet, useSearchParams, useLocation } from 'react-router';
import { useEffect, useRef, useState } from 'react';

import {
  Page,
  PageFooter,
  PageMobileNavigation,
  PageNavigation,
  PageTopNavigation,
  AgentSidebar,
} from '@qwery/ui/page';
import { SidebarProvider } from '@qwery/ui/shadcn-sidebar';
import type { Route } from '~/types/app/routes/project/+types/layout';
import type { ResizableContentRef } from '@qwery/ui/page';

import { LayoutFooter } from '../layout/_components/layout-footer';
import { LayoutMobileNavigation } from '../layout/_components/layout-mobile-navigation';
import { ProjectLayoutTopBar } from './_components/project-topbar';
import { ProjectSidebar } from './_components/project-sidebar';
import { AgentUIWrapper, type SidebarControl } from './_components/agent-ui-wrapper';
import { useWorkspace } from '~/lib/context/workspace-context';
import { WorkspaceModeEnum } from '@qwery/domain/enums';
import { AgentTabs, AgentStatusProvider } from '@qwery/ui/ai';
import { useGetMessagesByConversationSlug } from '~/lib/queries/use-get-messages';
import { NotebookSidebarProvider, useNotebookSidebar } from '~/lib/context/notebook-sidebar-context';

export async function loader(_args: Route.LoaderArgs) {
  return {
    layoutState: {
      open: true,
    },
  };
}

function SidebarLayoutInner(props: Route.ComponentProps & React.PropsWithChildren) {
  const { layoutState } = props.loaderData;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { repositories } = useWorkspace();
  const sidebarRef = useRef<ResizableContentRef>(null);
  const { registerSidebarControl } = useNotebookSidebar();
  
  // Only enable notebook sidebar behavior on notebook pages
  const isNotebookPage = location.pathname.startsWith('/notebook/');
  
  // Get conversation slug from URL params (for notebook chat integration)
  // If on conversation page, use that conversation; otherwise use default
  const conversationSlugFromUrl = searchParams.get('conversation');
  const conversationSlug = conversationSlugFromUrl || 'default';

  const agentWrapperRef = useRef<{ sendMessage: (text: string) => void } | null>(null);
  
  // Register sidebar control for notebook pages only
  useEffect(() => {
    if (isNotebookPage && sidebarRef.current) {
      registerSidebarControl({
        open: () => sidebarRef.current?.open(),
        sendMessage: (text: string) => {
          agentWrapperRef.current?.sendMessage(text);
        },
      });
    }
  }, [isNotebookPage, registerSidebarControl]);

  // Open sidebar when conversation param is present (only on notebook pages)
  const shouldOpenSidebar = isNotebookPage && !!conversationSlugFromUrl;

  // Load messages for the conversation when slug changes (only on notebook pages)
  // Add refetch interval when sidebar is open to catch newly persisted messages
  const messages = useGetMessagesByConversationSlug(
    repositories.conversation,
    repositories.message,
    conversationSlug,
    {
      // Only fetch messages on notebook pages when sidebar should be open
      enabled: shouldOpenSidebar,
      // Refetch every 2 seconds when sidebar is open to catch new messages
      refetchInterval: shouldOpenSidebar ? 2000 : undefined,
    },
  );

  return (
    <AgentStatusProvider>
      <SidebarProvider defaultOpen={layoutState.open}>
        <Page 
          agentSidebarOpen={shouldOpenSidebar}
          agentSidebarRef={isNotebookPage ? sidebarRef : undefined}
        >
          <PageTopNavigation>
            <ProjectLayoutTopBar />
          </PageTopNavigation>
          <PageNavigation>
            <ProjectSidebar />
          </PageNavigation>
          <PageMobileNavigation className={'flex items-center justify-between'}>
            <LayoutMobileNavigation />
          </PageMobileNavigation>
          <PageFooter>
            <LayoutFooter />
          </PageFooter>
          {/* Only show AgentSidebar on notebook pages */}
          {isNotebookPage && (
            <AgentSidebar>
              <AgentUIWrapper 
                ref={agentWrapperRef}
                key={conversationSlug}
                conversationSlug={conversationSlug}
                initialMessages={messages.data}
              />
            </AgentSidebar>
          )}
          {props.children}
        </Page>
      </SidebarProvider>
    </AgentStatusProvider>
  );
}

function SidebarLayout(props: Route.ComponentProps & React.PropsWithChildren) {
  return (
    <NotebookSidebarProvider>
      <SidebarLayoutInner {...props} />
    </NotebookSidebarProvider>
  );
}

function SimpleModeSidebarLayout(
  props: Route.ComponentProps & React.PropsWithChildren,
) {
  return (
    <AgentStatusProvider>
      <Page>
        <PageTopNavigation>
          <ProjectLayoutTopBar />
        </PageTopNavigation>
        <PageMobileNavigation className={'flex items-center justify-between'}>
          <LayoutMobileNavigation />
        </PageMobileNavigation>
        <PageFooter>
          <LayoutFooter />
        </PageFooter>
        <AgentSidebar>
          <AgentTabs
            tabs={[
              {
                id: 'query-sql-results',
                title: 'Results',
                description: 'Query SQL Results',
                component: <div>Query SQL Results</div>,
              },
              {
                id: 'query-sql-visualisation',
                title: 'Visualisation',
                description: 'Visualisation of the query SQL results',
                component: <div>Query SQL Results</div>,
              },
            ]}
          />
        </AgentSidebar>
        {props.children}
      </Page>
    </AgentStatusProvider>
  );
}

export default function Layout(props: Route.ComponentProps) {
  const { workspace } = useWorkspace();
  const SideBar =
    workspace.mode === WorkspaceModeEnum.SIMPLE
      ? SimpleModeSidebarLayout
      : SidebarLayout;
  return (
    <SideBar {...props}>
      <Outlet />
    </SideBar>
  );
}
