import { selfServices } from '@layouts/pages/mypages-sections/self-service/self-service/self-services';
import { ExternalLinkCard } from '@layouts/pages/mypages-sections/self-service/external-link-card/external-link-card.component';

export default function SelfService() {
  return (
    <div>
      <h1 className="pb-40">Självservice</h1>

      {selfServices.map((service, index) => {
        return (
          <div key={`service-category-${index}`} className="lg:pb-64 pb-24">
            <h3 className="pb-24">
              {service.name} ({service.services.length})
            </h3>

            <div className="lg:grid lg:grid-cols-2 lg:gap-24">
              {service.services.map((service, index) => {
                return (
                  <ExternalLinkCard
                    key={`external-link-card-${index}`}
                    title={service.title}
                    description={service.description}
                    url={service.url}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
