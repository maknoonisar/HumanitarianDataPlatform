import { Link } from "wouter";
import { Organization } from "@/lib/types";

interface OrganizationCardProps {
  organization: Organization;
}

const OrganizationCard = ({ organization }: OrganizationCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
          {organization.acronym || organization.name.charAt(0)}
        </div>
        <div className="ml-4">
          <h3 className="font-heading font-bold text-lg text-neutral-800">{organization.acronym}</h3>
          <p className="text-sm text-neutral-500">{organization.name}</p>
        </div>
      </div>
      
      <p className="text-sm text-neutral-500 mb-4">{organization.description}</p>
      
      <div className="mt-auto">
        <div className="flex justify-between text-sm mb-2">
          <span>Datasets:</span>
          <span className="font-semibold">{organization.datasetCount}</span>
        </div>
        <Link href={`/organizations/${organization.id}`} className="text-primary font-semibold text-sm hover:text-primary/80">
          View organization profile →
        </Link>
      </div>
    </div>
  );
};

export default OrganizationCard;
