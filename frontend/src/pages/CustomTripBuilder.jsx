import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, Card, FormField, Input, Select, Skeleton, Textarea } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { getTourPackages } from "../services/packages";
import { createCustomTripRequest } from "../services/customTrips";

import "../styles/custom-trips.css";

const initialValues = {
  tourPackage: "", preferredStartDate: "", travelers: "1", days: "", nights: "",
  itineraryChanges: "", accommodationPreferences: "", transportationPreferences: "",
  additionalActivities: "", customerMessage: "",
};

function minDate() {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  return today.toISOString().slice(0, 10);
}

function CustomTripBuilder() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [packages, setPackages] = useState([]);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [pageError, setPageError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPackages = useCallback(async () => {
    try {
      setLoadingPackages(true);
      setPageError("");
      const response = await getTourPackages({ status: "active" });
      setPackages(Array.isArray(response?.packages) ? response.packages : Array.isArray(response) ? response : []);
    } catch (error) {
      setPageError(error.message || "We couldn't load journeys right now.");
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => { loadPackages(); }, [loadPackages]);

  const selectedPackage = useMemo(
    () => packages.find((item) => item._id === values.tourPackage),
    [packages, values.tourPackage]
  );

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "", form: "" }));
  }

  function validate() {
    const next = {};
    if (!values.tourPackage) next.tourPackage = "Choose a base journey for your custom trip.";
    if (!values.preferredStartDate) next.preferredStartDate = "Tell us when you would like to travel.";
    else if (values.preferredStartDate < minDate()) next.preferredStartDate = "Choose a future date.";
    const travelers = Number(values.travelers);
    if (!Number.isInteger(travelers) || travelers < 1) next.travelers = "Travelers must be at least 1.";
    if (values.days && (!Number.isInteger(Number(values.days)) || Number(values.days) < 1)) next.days = "Days must be at least 1.";
    if (values.nights && (!Number.isInteger(Number(values.nights)) || Number(values.nights) < 0)) next.nights = "Nights cannot be negative.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting || !validate()) return;
    try {
      setSubmitting(true);
      setPageError("");
      const requestedDuration = {};
      if (values.days) requestedDuration.days = Number(values.days);
      if (values.nights) requestedDuration.nights = Number(values.nights);
      const response = await createCustomTripRequest({
        tourPackage: values.tourPackage,
        preferredStartDate: values.preferredStartDate,
        travelers: Number(values.travelers),
        ...(Object.keys(requestedDuration).length ? { requestedDuration } : {}),
        itineraryChanges: values.itineraryChanges.trim(),
        accommodationPreferences: values.accommodationPreferences.trim(),
        transportationPreferences: values.transportationPreferences.trim(),
        additionalActivities: values.additionalActivities.trim(),
        customerMessage: values.customerMessage.trim(),
      }, token);
      navigate(`/custom-trips/${response?.request?._id}`, { state: { submitted: true } });
    } catch (error) {
      if (error.status === 409 && error.data?.requestId) {
        navigate(`/custom-trips/${error.data.requestId}`);
        return;
      }
      setPageError(error.message || "We couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="custom-trip-page">
    <section className="custom-trip-hero"><div className="content-width">
      <span className="eyebrow">Tailored journeys</span>
      <h1 className="display-lg">Travel, made<br />entirely yours.</h1>
      <p>Start with a Hubsafari journey, then tell our travel designers how you want to make it your own.</p>
    </div></section>
    <section className="section"><div className="content-width custom-trip-builder">
      <div className="custom-trip-builder__intro"><span className="eyebrow">Your request</span><h2 className="display-md">The details that matter.</h2><p>We will review your preferences and send a considered proposal. You are not booking or paying yet.</p></div>
      <Card className="custom-trip-form" padding="lg">
        {pageError && <div className="custom-trip-alert" role="alert">{pageError}<button type="button" onClick={loadPackages}>Try again</button></div>}
        <form onSubmit={handleSubmit} noValidate>
          <fieldset disabled={submitting || loadingPackages}>
            <legend>Journey essentials</legend>
            {loadingPackages ? <Skeleton height="50px" /> : <FormField label="Base journey" required error={errors.tourPackage}><Select name="tourPackage" value={values.tourPackage} onChange={updateValue} placeholder="Select a journey" options={packages.map((item) => ({ value: item._id, label: `${item.title} · ${item.duration?.days || ""} days` }))} /></FormField>}
            {selectedPackage && <p className="custom-trip-form__package-note">Starting point: {selectedPackage.title}. Your proposal will be tailored around this journey.</p>}
            <div className="custom-trip-form__grid">
              <FormField label="Preferred start date" required error={errors.preferredStartDate}><Input name="preferredStartDate" type="date" min={minDate()} value={values.preferredStartDate} onChange={updateValue} /></FormField>
              <FormField label="Travelers" required error={errors.travelers}><Input name="travelers" type="number" min="1" step="1" value={values.travelers} onChange={updateValue} /></FormField>
            </div>
          </fieldset>
          <fieldset disabled={submitting}><legend>Shape the journey <span>(optional)</span></legend>
            <div className="custom-trip-form__grid"><FormField label="Requested days" error={errors.days}><Input name="days" type="number" min="1" step="1" value={values.days} onChange={updateValue} placeholder="e.g. 7" /></FormField><FormField label="Requested nights" error={errors.nights}><Input name="nights" type="number" min="0" step="1" value={values.nights} onChange={updateValue} placeholder="e.g. 6" /></FormField></div>
            <FormField label="Itinerary changes"><Textarea name="itineraryChanges" value={values.itineraryChanges} onChange={updateValue} placeholder="Places, pace, or experiences you would like to change" /></FormField>
            <div className="custom-trip-form__grid"><FormField label="Accommodation preferences"><Textarea name="accommodationPreferences" value={values.accommodationPreferences} onChange={updateValue} placeholder="Room style, hotel preferences, special needs" /></FormField><FormField label="Transportation preferences"><Textarea name="transportationPreferences" value={values.transportationPreferences} onChange={updateValue} placeholder="Flights, transfers, rail, or other preferences" /></FormField></div>
            <FormField label="Additional activities"><Textarea name="additionalActivities" value={values.additionalActivities} onChange={updateValue} placeholder="Experiences you would love to add" /></FormField>
            <FormField label="A note for your travel designer"><Textarea name="customerMessage" value={values.customerMessage} onChange={updateValue} placeholder="Anything else we should know?" /></FormField>
          </fieldset>
          <div className="custom-trip-form__actions"><Button type="submit" loading={submitting}>{submitting ? "Sending request" : "Request a custom proposal"}</Button><Link to="/trips">View my trips</Link></div>
        </form>
      </Card>
    </div></section>
  </main>;
}

export default CustomTripBuilder;
