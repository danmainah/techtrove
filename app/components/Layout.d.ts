declare module '@/components/Layout' {
  import { FC, ReactNode } from 'react';
  interface LayoutProps {
    children: ReactNode;
  }
  const Layout: FC<LayoutProps>;
  export default Layout;
}
