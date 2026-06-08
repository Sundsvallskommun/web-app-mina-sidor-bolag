import { Icon, Input } from '@sk-web-gui/react';
import { FunnelIcon, XIcon } from 'lucide-react';

interface AgreementsFilterProps {
  term: string;
  placeholder: string;
  changeHandler: (event: React.BaseSyntheticEvent) => void;
  resethandler: () => void;
}

const AgreementsFilter = ({ term, placeholder, changeHandler, resethandler }: AgreementsFilterProps) => {
  return (
    <Input.InnerGroup size="lg" className="mb-40 max-w-[520px]">
      <Input.LeftAddin icon>
        <Icon icon={<FunnelIcon />} />
      </Input.LeftAddin>
      <Input placeholder={placeholder} value={term} onChange={changeHandler} />
      {term.length > 0 && (
        <Input.RightAddin icon>
          <Icon role="button" icon={<XIcon />} onClick={resethandler} />
        </Input.RightAddin>
      )}
    </Input.InnerGroup>
  );
};

export default AgreementsFilter;
