import { AddressEntry } from "./SectionChip";
import { useTranslations } from "next-intl";
import { LinkIconWrapper } from "./LinkIconWrapper";
import { getFlagStyle } from "@/helpers";

// Types
interface AddressGridProps {
  data: AddressEntry[];
}

interface AddressCardProps {
  entry: AddressEntry;
  index: number;
  getCountryName: (country: string) => string;
}

// Constants
const FONT_FAMILY = "font-['Myriad_Pro',sans-serif]";
const TEXT_SIZE_SM = "text-[11px]";
const TEXT_INDENT = "ml-[18px]";
const FLAG_MARGIN = "ml-2";

// Country Header Component
const CountryHeader: React.FC<{
  country: string;
  getCountryName: (country: string) => string;
}> = ({ country, getCountryName }) => (
  <div className="flex items-center">
    <div style={getFlagStyle(country)} />
    <p
      className={`${FONT_FAMILY} ${TEXT_SIZE_SM} font-semibold text-black ${FLAG_MARGIN}`}
    >
      {getCountryName(country)}
    </p>
  </div>
);

// Company Header Component
const CompanyHeader: React.FC<{
  company: string;
  country: string;
  getCountryName: (country: string) => string;
}> = ({ company, country, getCountryName }) => (
  <>
    <div className="flex items-center mb-2">
      <p className={`${FONT_FAMILY} ${TEXT_SIZE_SM} font-semibold text-black`}>
        {company}
      </p>
    </div>
    <div className="flex flex-col items-start mb-2">
      <CountryHeader country={country} getCountryName={getCountryName} />
    </div>
  </>
);

// Address Details Component
const AddressDetails: React.FC<{
  street: string;
  city: string;
  phone: string;
}> = ({ street, city, phone }) => (
  <>
    <div className="flex flex-col items-start">
      <div className="flex items-center">
        <LinkIconWrapper />
        <p
          className={`${FONT_FAMILY} ${TEXT_SIZE_SM} font-normal text-black mb-0.5`}
        >
          {street}
        </p>
      </div>
    </div>

    <p
      className={`${FONT_FAMILY} ${TEXT_SIZE_SM} font-normal text-black ${TEXT_INDENT}`}
    >
      {city}
    </p>

    <p
      className={`${FONT_FAMILY} ${TEXT_SIZE_SM} font-normal text-black ${TEXT_INDENT}`}
    >
      {phone}
    </p>
  </>
);

// Individual Address Card Component
const AddressCard: React.FC<AddressCardProps> = ({
  entry,
  index,
  getCountryName
}) => {
  const { company, country, street, city, phone } = entry;

  return (
    <div key={index} className="flex flex-col">
      {company ? (
        <CompanyHeader
          company={company}
          country={country}
          getCountryName={getCountryName}
        />
      ) : (
        <div className="flex flex-col items-start mb-2">
          <CountryHeader country={country} getCountryName={getCountryName} />
        </div>
      )}

      <AddressDetails street={street} city={city} phone={phone} />
    </div>
  );
};

// Main Component
export const AddressGrid: React.FC<AddressGridProps> = ({ data }) => {
  const t = useTranslations("countries");

  const getCountryName = (country: string): string => t(country);

  if (!data?.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {data.map((entry, index) => (
        <AddressCard
          key={`address-${index}`}
          entry={entry}
          index={index}
          getCountryName={getCountryName}
        />
      ))}
    </div>
  );
};
