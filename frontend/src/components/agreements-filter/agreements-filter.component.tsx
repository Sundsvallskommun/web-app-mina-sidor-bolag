import { Icon } from '@sk-web-gui/react';
import { FunnelIcon, XIcon } from 'lucide-react';

interface AgreementsFilterProps {
  term: string;
  placeholder: string;
  changeHandler: (event: React.BaseSyntheticEvent) => void;
  resethandler: () => void;
}

const AgreementsFilter = ({ term, placeholder, changeHandler, resethandler }: AgreementsFilterProps) => {
  return (
    <div className="sk-search-field sk-searchfield-base-md mb-40 max-w-[520px]">
      <div
        role="group"
        data-hasleftaddon="false"
        data-hasrightaddon="false"
        className="sk-form-input-group-inner sk-form-input-group-inner-md"
      >
        <div className="sk-form-input-addin sk-form-input-addin-md sk-form-input-addin-left sk-search-field-base-icon">
          <Icon icon={<FunnelIcon />} />
        </div>
        <input
          data-hideextra="true"
          className="sk-form-input sk-form-input-md"
          placeholder={placeholder}
          data-cy="agreement-search-field"
          type="text"
          value={term}
          onChange={changeHandler}
        />
        {term.length > 0 && (
          <div className="sk-form-input-addin sk-form-input-addin-md sk-form-input-addin-right">
            <button
              aria-label="Rensa"
              type="button"
              data-color="primary"
              data-icon="true"
              data-background="false"
              className="sk-btn sk-btn-sm sk-btn-tertiary sk-search-field-button-reset"
              onClick={resethandler}
            >
              <Icon icon={<XIcon />} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgreementsFilter;
