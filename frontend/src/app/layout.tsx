import 'dayjs/locale/se';
import '../../tailwind.scss';
import MyAppLayout from '../layouts/app/layout.component';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const namespaces = ['organization'];
  return (
    <MyAppLayout locale="sv" namespaces={namespaces}>
      {children}
    </MyAppLayout>
  );
}
