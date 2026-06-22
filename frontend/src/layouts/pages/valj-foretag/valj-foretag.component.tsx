'use client';

import { CardElevated } from '@components/cards/card-elevated.component';
import { NoRepresent } from '@layouts/pages/valj-foretag/no-represent';
import { useAppContext } from '@contexts/app.context';
import { EntryLayout } from '@layouts/entry-layout.component';
import Main from '@layouts/main.component';
import { useRepresentingSwitch } from '@layouts/site-menu/site-menu-items';
import { useRepresentableEntities } from '@services/organisation-service';
import { Button, Icon, Pagination, RadioButton, Spinner, Table, cx, useThemeQueries } from '@sk-web-gui/react';
import { getAdjustedPathname, getRepresentingModeRoute } from '@utils/representingModeRoute';
import { ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PersonEngagement } from '@data-contracts/backend/data-contracts';
import { useTranslation } from 'react-i18next';
import { RepresentingMode } from '@interfaces/app';

export default function ValjForetag() {
  const router = useRouter();
  const { representingMode } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isMinDesktop, isMinSmallDevice } = useThemeQueries();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const { engagements, engagementsIsLoading } = useRepresentableEntities();
  const { setRepresenting } = useRepresentingSwitch();

  const [choosen, setChoosen] = useState('');

  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);

  const onChoice = (engagement: PersonEngagement) => {
    setError('');
    setChoosen(engagement.organizationNumber ?? '');
  };

  const onContinue = async () => {
    setLoading(true);
    const res = await setRepresenting({ organizationNumber: choosen, mode: RepresentingMode.BUSINESS });
    if (!res.error) {
      const path = searchParams?.get('path') || '';
      const myPagesAdjustedPathname = getAdjustedPathname(path, representingMode);
      router.push(myPagesAdjustedPathname || getRepresentingModeRoute(RepresentingMode.BUSINESS));
    } else {
      setError('Misslyckades med att välja företag');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (engagements) {
      setPages(Math.ceil(engagements.length / pageSize));
    }
  }, [currentPage, engagements, pageSize]);

  // Logged in user have no engagements
  if (!engagementsIsLoading && engagements?.length == 0) {
    return (
      <main>
        <NoRepresent />
      </main>
    );
  }
  return (
    <>
      {engagementsIsLoading ? (
        <main>
          <div className="w-screen h-screen flex place-items-center place-content-center">
            <Spinner aria-label="Hämtar företag" />
          </div>
        </main>
      ) : (
        <EntryLayout title="Välj företag" className="py-40 desktop:py-80 px-16">
          <div className="w-full max-w-[64rem]">
            <CardElevated className="pb-40 pt-32 desktop:pt-40 px-0 desktop:px-80">
              <Main>
                <div>
                  <h1 className="text-h2-sm desktop:text-h2-lg mb-24 desktop:mb-32">
                    {t('common:selectOrganizationToRepresent')}
                  </h1>
                </div>
                <div className="break-words">
                  {engagements?.length === 0 ? (
                    <div className="p-4 gap-2 grid grid-cols-2 bg-gray-lighter">
                      <div className="row-header-name">{t('common:noOrganizations')}</div>
                    </div>
                  ) : (
                    <Table
                      background
                      wrappingBorder
                      className={cx('mb-40 desktop:mb-24', !isMinDesktop && '[&_.sk-table-thead]:sr-only')}
                    >
                      <Table.Header className="bg-background-content border-black border-b-1">
                        {isMinDesktop ? (
                          <>
                            <Table.HeaderColumn className="sr-only">{t('common:select')}</Table.HeaderColumn>
                            <Table.HeaderColumn className="w-[210px]">{t('common:name')}</Table.HeaderColumn>
                            <Table.HeaderColumn className="max-w-[210px]">
                              {t('common:organizationNumber')}
                            </Table.HeaderColumn>
                          </>
                        ) : (
                          <Table.HeaderColumn>{t('common:selectOrganization')}</Table.HeaderColumn>
                        )}
                      </Table.Header>
                      <Table.Body>
                        {engagements?.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((e) => (
                          <Table.Row
                            key={`org-${e.organizationNumber}-${e.name}`}
                            className={cx('[&>td]:text-base [&>td]:cursor-default', !isMinDesktop && '[&>td]:h-full')}
                            onClick={() => onChoice(e)}
                          >
                            {isMinDesktop ? (
                              <>
                                <Table.Column>
                                  <RadioButton
                                    onChange={() => ({})}
                                    checked={e.organizationNumber === choosen}
                                    name="entity"
                                    aria-label={`${e.name}, välj organisation`}
                                  />
                                </Table.Column>
                                <Table.Column className="w-[210px]">
                                  <span className="font-bold">{e.name}</span>
                                  {e.isRepresentative ? <span className="ml-[.5em]">(ombud)</span> : null}
                                </Table.Column>
                                <Table.Column className="max-w-[210px]">{e.organizationNumber}</Table.Column>
                              </>
                            ) : (
                              <Table.Column>
                                <div className="flex gap-16 py-8">
                                  <RadioButton
                                    onChange={() => ({})}
                                    checked={e.organizationNumber === choosen}
                                    name="entity"
                                    aria-label={`${e.name}, välj organisation`}
                                  />
                                  <div className="grow flex flex-col gap-8">
                                    <div className="flex flex-col gap-y-4">
                                      <div className="font-bold">
                                        <span className="font-bold">{e.name}</span>
                                        {e.isRepresentative ? <span className="ml-[.5em]">(ombud)</span> : null}
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-y-4">
                                      <div>{`Org.nr. ${e.organizationNumber}`}</div>
                                    </div>
                                  </div>
                                </div>
                              </Table.Column>
                            )}
                          </Table.Row>
                        ))}
                      </Table.Body>
                      <Table.Footer>
                        <Pagination
                          className="w-full flex justify-center"
                          pagesBefore={isMinSmallDevice ? 1 : 0}
                          pagesAfter={isMinSmallDevice ? 1 : 0}
                          pages={pages}
                          activePage={currentPage}
                          changePage={(page) => setCurrentPage(page)}
                        />
                      </Table.Footer>
                    </Table>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    className="flex-grow desktop:flex-none"
                    data-cy="representingEntityButton"
                    loading={loading || engagementsIsLoading}
                    loadingText={loading ? 'Loggar in' : 'Hämtar bolagsengagemang'}
                    disabled={!choosen}
                    onClick={() => onContinue()}
                    rightIcon={<Icon icon={<ArrowRight />} />}
                  >
                    {t('common:continue')}
                  </Button>
                </div>
                {error && <p className="pt-4 pb-4 text-red-500">{error}</p>}
              </Main>
            </CardElevated>
          </div>
        </EntryLayout>
      )}
    </>
  );
}
