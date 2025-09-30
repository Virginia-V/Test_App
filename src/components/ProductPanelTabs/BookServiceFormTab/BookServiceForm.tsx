import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { joiResolver } from "@hookform/resolvers/joi";
import { Button } from "@/components/ui/button";
import { createBookServiceSchema } from "@/validation-schemas";
import { useTranslations } from "next-intl";
import {
  ControlledCheckbox,
  ControlledDatePicker,
  ControlledDropdown,
  ControlledTextField
} from "@/components/common";
import EmailIcon from "@mui/icons-material/Email";

type BookServiceFormFields = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  date: Date;
  service: string;
  consent: boolean;
};

export const BookServiceForm: React.FC = () => {
  const t = useTranslations();
  const {
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm<BookServiceFormFields>({
    resolver: joiResolver(createBookServiceSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      date: new Date(),
      service: "",
      consent: true
    },
    mode: "onChange"
  });

  const onSubmit = (data: BookServiceFormFields) => {
    console.log("Form Data Submitted:", data);
    toast.success(t("form.successMessage"), {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      pauseOnHover: true,
      draggable: true,
      theme: "colored"
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center pb-2">
        <h2 className="text-3xl font-bold mb-2">{t("form.getInTouch")}</h2>
        <p className="text-gray-600 mb-2">{t("form.sendRequest")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <ControlledTextField
              control={control}
              name="firstName"
              label={t("form.firstName")}
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              required
            />
          </div>
          <div>
            <ControlledTextField
              control={control}
              name="lastName"
              label={t("form.lastName")}
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              required
            />
          </div>
          <div>
            <ControlledTextField
              control={control}
              name="phone"
              label={t("form.phoneNumber")}
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message}
              required
            />
          </div>
          <div>
            <ControlledTextField
              control={control}
              name="email"
              label={t("form.email")}
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              required
            />
          </div>
          <div>
            <ControlledDatePicker
              control={control}
              name="date"
              label={t("form.date")}
              fullWidth
              error={!!errors.date}
              helperText={errors.date?.message}
              required
            />
          </div>
          <div>
            <ControlledDropdown
              control={control}
              name="service"
              label={t("form.selectProducts")}
              fullWidth
              error={!!errors.service}
              helperText={errors.service?.message}
              required
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 w-140">
          <ControlledCheckbox
            control={control}
            name="consent"
            label={t("form.consentCheckbox")}
            error={!!errors.consent}
            helperText={errors.consent?.message}
          />
        </div>

        <Button
          type="submit"
          disabled={!isValid}
          className="w-full mt-6 bg-[#8F4B27] text-white font-semibold text-base py-5 cursor-pointer hover:bg-[var(--color-caramel)] active:bg-[var(--color-caramel)] focus:bg-[var(--color-caramel)]"
        >
          <EmailIcon fontSize="small" />
          {t("form.sendTheRequest")}
        </Button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">{t("form.privacyNotice")}</p>
        </div>
      </form>
    </div>
  );
};
