import Joi from "joi";

export const PhonePattern =
  /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{1,4})[-. )]*(\d{1,4})[-. ]*(\d{1,4})[-. ]*(\d{1,4})[-. ]*(\d{1,4})(?: *x(\d+))?\s*$/;

export const createBookServiceSchema = (t: (key: string) => string) =>
  Joi.object({
    firstName: Joi.string()
      .trim()
      .required()
      .messages({
        "string.empty": t("validation.mandatoryField"),
        "any.required": t("validation.mandatoryField")
      }),

    lastName: Joi.string()
      .trim()
      .required()
      .messages({
        "string.empty": t("validation.mandatoryField"),
        "any.required": t("validation.mandatoryField")
      }),

    phone: Joi.string()
      .pattern(PhonePattern)
      .required()
      .messages({
        "string.empty": t("validation.mandatoryField"),
        "string.pattern.base": t("validation.invalidPhoneFormat"),
        "any.required": t("validation.mandatoryField")
      }),

    email: Joi.string()
      .trim()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": t("validation.mandatoryField"),
        "string.email": t("validation.invalidEmailFormat"),
        "any.required": t("validation.mandatoryField")
      }),

    date: Joi.date()
      .required()
      .messages({
        "date.base": t("validation.invalidDate"),
        "any.required": t("validation.mandatoryField")
      }),

    service: Joi.string()
      .trim()
      .required()
      .messages({
        "string.empty": t("validation.mandatoryField"),
        "any.required": t("validation.mandatoryField")
      }),

    consent: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        "any.only": t("validation.privacyPolicyRequired"),
        "any.required": t("validation.privacyPolicyRequired")
      })
  });
