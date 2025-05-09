'use client';

import { CardElevated } from '@components/cards/card-elevated.component';
import { NoRepresent } from '@layouts/pages/valj-foretag/no-represent';
import { useAppContext } from '@contexts/app.context';
import { Engagement } from '@data-contracts/businessengagements/data-contracts';
import { RepresentingMode } from '@interfaces/app';
import { EntryLayout } from '@layouts/entry-layout.component';
import Main from '@layouts/main.component';
import { useRepresentingSwitch } from '@layouts/site-menu/site-menu-items';
import { useCombinedBusinessEngagements } from '@services/organisation-service';
import { Button, Icon, Pagination, RadioButton, Spinner, Table, cx, useThemeQueries } from '@sk-web-gui/react';
import { getAdjustedPathname, getRepresentingModeRoute } from '@utils/representingModeRoute';
import { ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ValjForetag() {
  const router = useRouter();
  const { representingMode } = useAppContext();
  const [error, setError] = useState('');
  const { isMinDesktop, isMinSmallDevice } = useThemeQueries();
  const searchParams = useSearchParams();

  const { engagements, engagementsIsLoading } = useCombinedBusinessEngagements();
  const { setRepresenting } = useRepresentingSwitch();

  const [choosen, setChoosen] = useState('');

  const pageSize = 10;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);

  const onChoice = (engagement: Engagement) => {
    setError('');
    setChoosen(engagement.organizationNumber ?? '');
  };

  const onContinue = async () => {
    const res = await setRepresenting({ organizationNumber: choosen, mode: RepresentingMode.BUSINESS });
    if (!res.error) {
      const path = searchParams?.get('path') || '';
      const myPagesAdjustedPathname = getAdjustedPathname(path, representingMode);
      router.push(myPagesAdjustedPathname || getRepresentingModeRoute(RepresentingMode.BUSINESS));
    } else {
      setError('Misslyckades med att välja företag');
    }
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
        <EntryLayout title="Välj företag" className="lg:py-80 py-40 px-16">
          <div className="w-full max-w-[73.8rem] pt-16">
            <CardElevated className="py-40 px-14 lg:px-80">
              <Main>
                <div>
                  <h1 className="text-center text-h1-small lg:text-h2-lg">Välj organisationen du vill företräda</h1>
                </div>
                <div className="break-words">
                  {engagements?.length === 0 ? (
                    <div className="p-4 gap-2 grid grid-cols-2 bg-gray-lighter">
                      <div className="row-header-name">Inga organisationer hittades</div>
                    </div>
                  ) : (
                    <Table background className={cx('mt-24 mb-24', !isMinDesktop && '[&_.sk-table-thead]:sr-only')}>
                      <Table.Header className="bg-background-content border-black border-b-1">
                        {isMinDesktop ? (
                          <>
                            <Table.HeaderColumn className="sr-only">Välj</Table.HeaderColumn>
                            <Table.HeaderColumn>Namn</Table.HeaderColumn>
                            <Table.HeaderColumn>Organisationsnummer</Table.HeaderColumn>
                          </>
                        ) : (
                          <Table.HeaderColumn>Välj organisation</Table.HeaderColumn>
                        )}
                      </Table.Header>
                      <Table.Body>
                        {engagements?.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((e) => (
                          <Table.Row
                            key={`org-${e.organizationNumber}-${e.organizationName}`}
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
                                    aria-label={`${e.organizationName}, välj organisation`}
                                  />
                                </Table.Column>
                                <Table.Column>
                                  <span className="font-bold">{e.organizationName}</span>
                                  {e.isRepresentative ? <span className="ml-[.5em]">(ombud)</span> : null}
                                </Table.Column>
                                <Table.Column>{e.organizationNumber}</Table.Column>
                              </>
                            ) : (
                              <Table.Column>
                                <div className="flex gap-16 py-8">
                                  <RadioButton
                                    onChange={() => ({})}
                                    checked={e.organizationNumber === choosen}
                                    name="entity"
                                    aria-label={`${e.organizationName}, välj organisation`}
                                  />
                                  <div className="grow flex flex-col gap-8">
                                    <div className="flex flex-col gap-y-4">
                                      <div className="font-bold">
                                        <span className="font-bold">{e.organizationName}</span>
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
                    data-cy="representingEntityButton"
                    loading={engagementsIsLoading}
                    loadingText={'Hämtar bolagsengagemang'}
                    disabled={!choosen}
                    onClick={() => onContinue()}
                    rightIcon={<Icon icon={<ArrowRight />} />}
                  >
                    Fortsätt
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
