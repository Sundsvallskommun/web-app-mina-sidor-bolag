import 'dayjs/locale/se';
import '../../tailwind.scss';
import MyAppLayout from '../layouts/app/layout.component';

export default function Layout({ children }) {
  const namespaces = ['organization'];
  return (
    <MyAppLayout locale="sv" namespaces={namespaces}>
      {children}
    </MyAppLayout>
  );
}
