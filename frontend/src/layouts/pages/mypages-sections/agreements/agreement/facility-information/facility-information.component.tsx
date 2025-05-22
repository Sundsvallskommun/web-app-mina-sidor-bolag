import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { Divider } from '@sk-web-gui/react';

export const FacilityInformation = (props: { facility: InstalledBaseItem }) => {
  const { facility } = props;

  const acceptedMetaDataKeys = [
    'annualusage',
    'equipmentNumber',
    'fusesize',
    'netarea',
    'propertyDesignation',
    'debiteffect',
  ];

  return (
    <div className="pt-16">
      <Divider.Section className="md:text-h3-lg text-h3-sm">Anläggningsinformation</Divider.Section>
      <div className="lg:grid lg:grid-cols-4 lg:gap-y-40 pt-24">
        {facility.metaData &&
          facility.metaData.map((meta, index) => {
            return (
              acceptedMetaDataKeys.includes(meta.key ?? '') && (
                <div key={index} className="lg:pb-0 pb-32">
                  <strong>{meta.displayName}</strong>
                  <p>
                    {meta.value} {meta.type?.length && meta.type.length < 4 ? meta.type : null}
                  </p>
                </div>
              )
            );
          })}
      </div>
    </div>
  );
};
