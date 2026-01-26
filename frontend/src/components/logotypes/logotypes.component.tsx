import { LogoGroup } from './logo-group.component';
import { useRelations } from '@utils/use-relations.hook';

interface LogotypeProps {
  width?: number;
  height?: number;
}

export const Logotypes = (props: LogotypeProps) => {
  const { width, height } = props;

  const { activeCustomerEngagements } = useRelations();

  return (
    <div className="flex gap-24">
      <LogoGroup height={height} width={width} organizations={activeCustomerEngagements} />
    </div>
  );
};
