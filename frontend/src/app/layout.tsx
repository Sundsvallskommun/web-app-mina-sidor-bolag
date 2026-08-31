import 'dayjs/locale/sv';
import '../../tailwind.scss';
import MyAppLayout from '../layouts/app/layout.component';
import i18nConfig from './i18nConfig';

interface LayoutProps {
  children?: React.ReactNode;
  params: Promise<{ locale?: string }>;
}

export const generateStaticParams = () => i18nConfig.locales.map((locale) => ({ locale }));

export default async function Layout({ children, params }: Readonly<LayoutProps>) {
  const { locale } = await params;
  return <MyAppLayout locale={locale ?? 'sv'}>{children}</MyAppLayout>;
}
