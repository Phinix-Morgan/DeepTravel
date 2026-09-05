import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { Button, Card, EmptyState, FormField, Select, Skeleton, StatusBadge } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { getDeparturesByPackage } from "../services/packages";
import { acceptCustomTripQuote, getCustomTripRequestById } from "../services/customTrips";

import "../styles/custom-trips.css";

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value)) : "Not specified";
}
function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}
function isExpired(request) {
  return request?.status === "expired" || Boolean(request?.quoteExpiresAt && new Date(request.quoteExpiresAt) <= new Date());
}
function Detail({ label, children }) {
  return <div className="custom-trip-detail"><dt>{label}</dt><dd>{children || "Not specified"}</dd></div>;
}

function CustomTripDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [request, setRequest] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [departure, setDeparture] = useState("");
  const [loading, setLoading] = useState(true);
  const [departureLoading, setDepartureLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const response = await getCustomTripRequestById(id, token);
      setRequest(response?.request || null);
    } catch (err) { setError(err.message || "Unable to load this request."); }
    finally { setLoading(false); }
  }, [id, token]);

  useEffect(() => { if (token) loadRequest(); }, [loadRequest, token]);

  const quoteAvailable = request?.status === "quoted" && !isExpired(request);
  const loadDepartures = useCallback(async () => {
    if (!quoteAvailable || !request?.tourPackage?._id) return;
    try {
      setDepartureLoading(true);
      const response = await getDeparturesByPackage(request.tourPackage._id);
      const available = Array.isArray(response?.departures) ? response.departures : [];
      setDepartures(available);
      setDeparture(available[0]?._id || "");
    } catch (err) { setError(err.message || "Unable to load available departures."); }
    finally { setDepartureLoading(false); }
  }, [quoteAvailable, request?.tourPackage?._id]);

  useEffect(() => { loadDepartures(); }, [loadDepartures]);

  async function handleAccept() {
    if (!quoteAvailable || accepting || !departure) return;
    try {
      setAccepting(true); setError("");
      const response = await acceptCustomTripQuote(id, departure, token);
      if (!response?.booking?._id) throw new Error("The booking was created, but we could not open it.");
      navigate(`/trips/${response.booking._id}`);
    } catch (err) {
      setError(err.message || "We couldn't accept this quote. Please try again.");
      await loadRequest();
    } finally { setAccepting(false); }
  }

  if (loading) return <main className="custom-trip-page"><section className="section"><div className="content-width custom-trip-loading"><Skeleton height="18px" width="120px" /><Skeleton height="78px" /><Skeleton height="280px" /></div></section></main>;
  if (error && !request) return <main className="custom-trip-page"><section className="section"><div className="content-width"><EmptyState title="Request unavailable" description={error} action={<Button as={Link} to="/trips">Back to my trips</Button>} /></div></section></main>;
  if (!request) return null;

  const packageData = request.tourPackage || {};
  const expired = isExpired(request);
  return <main className="custom-trip-page">
    <section className="custom-trip-hero custom-trip-hero--compact"><div className="content-width custom-trip-hero__row"><div><span className="eyebrow">Custom trip request</span><h1 className="display-md">{packageData.title || "Your tailored journey"}</h1></div><StatusBadge status={expired ? "expired" : request.status} /></div></section>
    <section className="section"><div className="content-width custom-trip-details">
      {state?.submitted && <div className="custom-trip-success" role="status">Your request is with our travel designers. We’ll let you know when your proposal is ready.</div>}
      {error && <div className="custom-trip-alert" role="alert">{error}<button type="button" onClick={loadRequest}>Refresh</button></div>}
      <div className="custom-trip-details__main">
        <Card padding="lg"><span className="eyebrow">Your brief</span><h2>Journey overview</h2>
          <dl className="custom-trip-details__grid"><Detail label="Preferred start">{formatDate(request.preferredStartDate)}</Detail><Detail label="Travelers">{request.travelers}</Detail><Detail label="Requested duration">{request.requestedDuration?.days ? `${request.requestedDuration.days} days${request.requestedDuration.nights !== undefined ? ` / ${request.requestedDuration.nights} nights` : ""}` : "Flexible"}</Detail><Detail label="Request reference">#{request._id?.slice(-8).toUpperCase()}</Detail></dl>
          <div className="custom-trip-notes"><Detail label="Itinerary changes">{request.itineraryChanges}</Detail><Detail label="Accommodation">{request.accommodationPreferences}</Detail><Detail label="Transportation">{request.transportationPreferences}</Detail><Detail label="Activities">{request.additionalActivities}</Detail><Detail label="Your message">{request.customerMessage}</Detail></div>
        </Card>
        {request.status === "accepted" && request.booking && <Card padding="lg" className="custom-trip-booking-link"><span className="eyebrow">Booking created</span><h2>Your proposal is reserved.</h2><p>Complete payment through the secure checkout in your booking.</p><Button as={Link} to={`/trips/${request.booking}`}>Continue to payment</Button></Card>}
      </div>
      <aside className="custom-trip-quote">
        <Card padding="lg"><span className="eyebrow">{quoteAvailable ? "Your proposal" : "Proposal status"}</span>
          {quoteAvailable ? <><h2>Ready when you are.</h2><div className="custom-trip-price"><span>Quoted total</span><strong>{formatCurrency(request.quotedTotalPrice)}</strong><small>{formatCurrency(request.quotedPricePerPerson)} per traveler</small></div><p className="custom-trip-quote__note">{request.adminNotes || "Your travel designer has prepared this proposal for your requested journey."}</p>
            {request.quoteExpiresAt && <p className="custom-trip-expiry">Accept by {formatDate(request.quoteExpiresAt)}</p>}
            <FormField label="Available departure" required helperText="Select the departure that works for you. Your preferred date is included in your request.">
              {departureLoading ? <Skeleton height="50px" /> : <Select value={departure} onChange={(event) => setDeparture(event.target.value)} placeholder="Select a departure" options={departures.map((item) => ({ value: item._id, label: `${formatDate(item.departureDate)} · ${item.remainingSeats ?? Math.max(0, item.capacity - item.bookedSeats)} seats available` }))} />}
            </FormField>
            {!departureLoading && departures.length === 0 && <p className="custom-trip-quote__warning">There are no open departures available for this proposal. Please contact us to revise your dates.</p>}
            <Button className="custom-trip-quote__accept" loading={accepting} disabled={!departure || departures.length === 0} onClick={handleAccept}>Accept quote & continue</Button><p className="custom-trip-quote__fine-print">Accepting creates a pending booking. You will review and securely pay for it next.</p>
          </> : <><h2>{expired ? "This proposal has expired." : request.status === "rejected" ? "This request wasn’t approved." : request.status === "cancelled" ? "This request was cancelled." : "Your proposal is in progress."}</h2><p>{expired ? "Please start a new request and we’ll be happy to create an updated proposal." : request.status === "rejected" ? "Contact DeepTravel if you would like to discuss another journey." : "Our travel designers are reviewing your details. We’ll add your pricing and notes here when it is ready."}</p>{expired && <Button as={Link} to="/custom-trip">Start a new request</Button>}</>}
        </Card>
      </aside>
    </div></section>
  </main>;
}
export default CustomTripDetails;
