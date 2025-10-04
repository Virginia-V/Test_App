import { PRODUCT_ICONS } from "@/lib";

// Types
export interface Review {
  author: string;
  date: string;
  rating: number;
  comment: string;
}

export interface SocialIcon {
  src: string;
  alt: string;
  width: number;
  height: number;
  opacity?: string;
}
const ICON_SIZE = 24;

export const companyBasics = {
  denomination: "artenova",
  country: "france",
  creationYear: "2002",
  businessSector: "furnitures",
  employe: "na",
  juridicForm: "srl"
};

export const positioning = ["premium", "luxe"];
export const spokenLanguages = ["french", "english", "spanish", "german"];
export const labels = ["iso2000"];
export const values = ["durabilite", "innovation"];
export const tradeShows = [
  "houseAndObject",
  "furnitureExhibition",
  "mmCologne"
];
export const awards = ["houseAndObject", "furnitureExhibition"];

export const infoItemsTop = [
  {
    label: "denomination",
    value: companyBasics.denomination,
    icon: PRODUCT_ICONS.Denomination_Icon.src
  },
  {
    label: "country",
    value: companyBasics.country,
    icon: PRODUCT_ICONS.Country_Icon.src
  },
  {
    label: "creationYear",
    value: companyBasics.creationYear,
    icon: PRODUCT_ICONS.Creation_Year_Icon.src
  }
];

export const infoItemsBottom = [
  {
    label: "businessSector",
    value: companyBasics.businessSector,
    icon: PRODUCT_ICONS.Business_Sector_Icon.src
  },
  {
    label: "employees",
    value: companyBasics.employe,
    icon: PRODUCT_ICONS.Employee_Icon.src
  },
  {
    label: "juridicForm",
    value: companyBasics.juridicForm,
    icon: PRODUCT_ICONS.Juridic_Form_Icon.src
  }
];

export const otherInfoItemsLeft = [
  {
    label: "positioning",
    values: positioning,
    icon: PRODUCT_ICONS.Positioning_Icon.src
  },
  {
    label: "spokenLanguages",
    values: spokenLanguages,
    icon: PRODUCT_ICONS.Language_Icon.src
  },
  {
    label: "labels",
    values: labels,
    icon: PRODUCT_ICONS.Label_Secondary_Icon.src
  }
];

export const otherInfoItemsRight = [
  {
    label: "values",
    values: values,
    icon: PRODUCT_ICONS.Value_Icon.src
  },
  {
    label: "tradeShows",
    values: tradeShows,
    icon: PRODUCT_ICONS.Presence_Trade_Shows_Icon.src
  },
  {
    label: "awards",
    values: awards,
    icon: PRODUCT_ICONS.Award_Icon.src
  }
];

export const showrooms = [
  {
    country: "france",
    street: "Rue du Faubourg St-Honore",
    city: "75008, Paris",
    phone: "+33 1 40 20 50 60" // France
  },
  {
    country: "unitedKingdom",
    street: "Baker Street 16",
    city: "LDN10102, London",
    phone: "+44 20 7946 0958" // United Kingdom
  },
  {
    country: "italy",
    street: "Via Roma 42",
    city: "00184, Rome",
    phone: "+39 06 1234 5678" // Italy
  },
  {
    country: "germany",
    street: "Berliner Straße 18",
    city: "10117, Berlin",
    phone: "+49 30 12345678" // Germany
  },
  {
    country: "spain",
    street: "Calle Mayor 12",
    city: "28013, Madrid",
    phone: "+34 91 123 4567" // Spain
  },
  {
    country: "usa",
    street: "5th Avenue 731",
    city: "10022, New York",
    phone: "+1 212 555 1234" // USA
  },
  {
    country: "canada",
    street: "Granville Street 950",
    city: "V6Z 1L2, Vancouver",
    phone: "+1 604 555 1234" // Canada
  },
  {
    country: "switzerland",
    street: "Bahnhofstrasse 15",
    city: "8001, Zürich",
    phone: "+41 44 123 4567" // Switzerland
  },
  {
    country: "netherlands",
    street: "Keizersgracht 75",
    city: "1015 CE, Amsterdam",
    phone: "+31 20 123 4567" // Netherlands
  },
  {
    country: "portugal",
    street: "Avenida da Liberdade 210",
    city: "1250-147, Lisboa",
    phone: "+351 21 123 4567" // Portugal
  },
  {
    country: "austria",
    street: "Mariahilfer Straße 35",
    city: "1060, Wien",
    phone: "+43 1 123 4567" // Austria
  },
  {
    country: "sweden",
    street: "Drottninggatan 44",
    city: "11121, Stockholm",
    phone: "+46 8 123 4567" // Sweden
  }
];

export const resellers = [
  {
    company: "ARTENOVA",
    country: "france",
    street: "Rue du Faubourg St-Honore",
    city: "75008 Paris",
    phone: "+33 1 40 20 50 60" // France
  },
  {
    company: "CRONOS",
    country: "unitedKingdom",
    street: "Baker Street 16",
    city: "LD20102 London",
    phone: "+44 20 7946 0958" // United Kingdom
  },
  {
    company: "BELINI",
    country: "italy",
    street: "Via Roma 42",
    city: "00184 Rome",
    phone: "+39 06 1234 5678" // Italy
  },
  {
    company: "ATM DISC",
    country: "germany",
    street: "Berliner Straße 18",
    city: "10117 Berlin",
    phone: "+49 30 12345678" // Germany
  },
  {
    company: "SANTINI",
    country: "spain",
    street: "Calle Mayor 12",
    city: "28013 Madrid",
    phone: "+34 91 123 4567" // Spain
  },
  {
    company: "BELAY EXP",
    country: "usa",
    street: "5th Avenue 731",
    city: "10022 New York",
    phone: "+1 212 555 1234" // USA
  },
  {
    company: "SOMIX",
    country: "canada",
    street: "Granville Street 950",
    city: "V6Z1L2 Vancouver",
    phone: "+1 604 555 1234" // Canada
  },
  {
    company: "SHWEISS",
    country: "switzerland",
    street: "Bahnhofstrasse 15",
    city: "8001 Zürich",
    phone: "+41 44 123 4567" // Switzerland
  },
  {
    company: "FLUTT",
    country: "netherlands",
    street: "Keizersgracht 75",
    city: "1015 CE Amsterdam",
    phone: "+31 20 123 4567" // Netherlands
  },
  {
    company: "DOS SANTOS",
    country: "portugal",
    street: "Avenida da Liberdade 210",
    city: "1250-147 Lisboa",
    phone: "+351 21 123 4567" // Portugal
  },
  {
    company: "HEINZ",
    country: "austria",
    street: "Mariahilfer Straße 33",
    city: "1060 Wien",
    phone: "+43 1 123 4567" // Austria
  },
  {
    company: "THYSSEN",
    country: "sweden",
    street: "Drottninggatan 44",
    city: "11121 Stockholm",
    phone: "+46 8 123 4567" // Sweden
  }
];

export const distributors = [
  {
    country: "france",
    street: "Rue du Faubourg St-Honore",
    city: "75008, Paris",
    phone: "+33 1 40 20 50 60" // France
  },
  {
    country: "unitedKingdom",
    street: "Baker Street 16",
    city: "LD201102, London",
    phone: "+44 20 7946 0958" // United Kingdom
  },
  {
    country: "italy",
    street: "Via Roma 42",
    city: "00184, Rome",
    phone: "+39 06 1234 5678" // Italy
  },
  {
    country: "germany",
    street: "Berliner Straße 18",
    city: "10117, Berlin",
    phone: "+49 30 12345678" // Germany
  },
  {
    country: "spain",
    street: "Calle Mayor 12",
    city: "28013, Madrid",
    phone: "+34 91 123 4567" // Spain
  },
  {
    country: "usa",
    street: "5th Avenue 731",
    city: "10022, New York",
    phone: "+1 212 555 1234" // USA
  },
  {
    country: "canada",
    street: "Granville Street 950",
    city: "V6Z 1L2, Vancouver",
    phone: "+1 604 555 1234" // Canada
  },
  {
    country: "switzerland",
    street: "Bahnhofstrasse 15",
    city: "8001, Zurich",
    phone: "+41 44 123 4567" // Switzerland
  },
  {
    country: "netherlands",
    street: "Keizersgracht 75",
    city: "1015 CE, Amsterdam",
    phone: "+31 20 123 4567" // Netherlands
  },
  {
    country: "portugal",
    street: "Avenida da Liberdade 210",
    city: "1250-147, Lisboa",
    phone: "+351 21 123 4567" // Portugal
  },
  {
    country: "austria",
    street: "Mariahilfer Straße 53",
    city: "1060, Wien",
    phone: "+43 1 123 4567" // Austria
  },
  {
    country: "sweden",
    street: "Drottninggatan 44",
    city: "11121, Stockholm",
    phone: "+46 8 123 4567" // Sweden
  }
];

// Mock data for reviews
export const MOCK_REVIEWS: Review[] = [
  {
    author: "Tim Tmor",
    date: "3 weeks ago",
    rating: 4.5,
    comment:
      "Great experience! Highly recommended. The service was excellent and the product was top-notch."
  },
  {
    author: "Nabee Khan",
    date: "4 weeks ago",
    rating: 5,
    comment:
      "Exceptional quality and customer service. I'm very happy with my purchase."
  },
  {
    author: "Charlie Brown",
    date: "3 months ago",
    rating: 4,
    comment:
      "A solid product with a few minor issues. I would recommend it with some reservations."
  },
  {
    author: "Diana Prince",
    date: "4 months ago",
    rating: 5,
    comment:
      "Absolutely amazing! The best product I've ever used. I highly recommend it to everyone."
  },
  {
    author: "Alice Smith",
    date: "1 month ago",
    rating: 4,
    comment:
      "Good product, and the delivery was fast. Overall, I'm very satisfied."
  },
  {
    author: "Bob Johnson",
    date: "2 months ago",
    rating: 5,
    comment:
      "The product arrived in perfect condition. I contacted customer support, and they were very helpful."
  },
  {
    author: "Eva Green",
    date: "1 month ago",
    rating: 4.5,
    comment: "Excellent product! I would definitely recommend it to others."
  },
  {
    author: "Frank White",
    date: "2 weeks ago",
    rating: 5,
    comment:
      "The best purchase I've made in a long time. Great value for the money!"
  }
];

export const SOCIAL_ICONS: SocialIcon[] = [
  {
    src: PRODUCT_ICONS.Facebook_Icon.src,
    alt: "Facebook",
    width: ICON_SIZE,
    height: ICON_SIZE
  },
  {
    src: PRODUCT_ICONS.Instagram_Icon.src,
    alt: "Instagram",
    width: ICON_SIZE,
    height: ICON_SIZE
  },
  {
    src: PRODUCT_ICONS.Shape_Icon.src,
    alt: "Shape",
    width: ICON_SIZE,
    height: ICON_SIZE
  },
  {
    src: PRODUCT_ICONS.Pinterest_Icon.src,
    alt: "Pinterest",
    width: ICON_SIZE,
    height: ICON_SIZE
  },
  {
    src: PRODUCT_ICONS.Linkedin_Icon.src,
    alt: "LinkedIn",
    width: ICON_SIZE,
    height: 34,
    opacity: "opacity-20"
  }
];
