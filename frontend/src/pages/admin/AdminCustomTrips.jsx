import { useCallback, useEffect, useState } from "react";
import {
  Button,
  DataTable,
  FormField,
  Input,
  Modal,
  Select,
  StatusBadge,
  Textarea,
  useToast,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminCustomTrip,
  getAdminCustomTrips,
  updateAdminCustomTripQuote,
  updateAdminCustomTripStatus,
} from "../../services/admin";
import { date, money, PageHeading, Info } from "./AdminShared";

export default function AdminCustomTrips() {
  const { token } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState({
    quotedPricePerPerson: "",
    adminNotes: "",
    quoteExpiresAt: "",
  });

  const load = useCallback(
    async () => {
      try {
        setLoading(true);

        const r = await getAdminCustomTrips(token);

        setItems(
          status
            ? r.requests.filter((x) => x.status === status)
            : r.requests
        );
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    },
    [status, token, toast]
  );

  useEffect(() => {
    load();
  }, [load]);

  async function open(r) {
    try {
      const result = await getAdminCustomTrip(r._id, token);

      setDetail(result);

      const q = result.request;

      setQuote({
        quotedPricePerPerson: q.quotedPricePerPerson ?? "",
        adminNotes: q.adminNotes || "",
        quoteExpiresAt: q.quoteExpiresAt?.slice(0, 10) || "",
      });
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function setRequestStatus(next) {
    try {
      setSaving(true);

      await updateAdminCustomTripStatus(
        detail.request._id,
        next,
        token
      );

      toast.success("Request status updated.");

      setDetail(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveQuote(e) {
    e.preventDefault();

    try {
      setSaving(true);

      await updateAdminCustomTripQuote(
        detail.request._id,
        {
          ...quote,
          quotedPricePerPerson: Number(
            quote.quotedPricePerPerson
          ),
          quoteExpiresAt: quote.quoteExpiresAt || null,
        },
        token
      );

      toast.success("Quote saved.");

      setDetail(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeading
        title="Custom trips"
        description="Review bespoke journey requests and send considered proposals."
      />

      <div className="admin-toolbar">
        <Select
          aria-label="Request status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "", label: "All requests" },
            ...[
              "pending",
              "reviewing",
              "quoted",
              "accepted",
              "rejected",
              "expired",
              "cancelled",
            ].map((v) => ({
              value: v,
              label: v,
            })),
          ]}
        />
      </div>

      <DataTable
        loading={loading}
        data={items}
        keyField="_id"
        onRowClick={open}
        columns={[
          {
            key: "tourPackage",
            title: "Journey",
            render: (r) => (
              <strong>{r.tourPackage?.title}</strong>
            ),
          },
          {
            key: "user",
            title: "Traveler",
            render: (r) => r.user?.name,
          },
          {
            key: "preferredStartDate",
            title: "Preferred date",
            render: (r) => date(r.preferredStartDate),
          },
          {
            key: "travelers",
            title: "Travelers",
          },
          {
            key: "status",
            title: "Status",
            render: (r) => (
              <StatusBadge status={r.status} />
            ),
          },
        ]}
      />

      <Modal
        isOpen={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Custom trip request"
        size="xl"
      >
        {detail?.request && (
          <div className="admin-details">
            <div className="admin-detail-grid">
              <Info label="Traveler">
                {detail.request.user?.name} ·{" "}
                {detail.request.user?.email}
              </Info>

              <Info label="Journey">
                {detail.request.tourPackage?.title}
              </Info>

              <Info label="Preferred start">
                {date(detail.request.preferredStartDate)}
              </Info>

              <Info label="Travelers">
                {detail.request.travelers}
              </Info>

              <Info label="Duration">
                {detail.request.requestedDuration?.days
                  ? `${detail.request.requestedDuration.days} days / ${
                      detail.request.requestedDuration.nights || 0
                    } nights`
                  : "Flexible"}
              </Info>

              <Info label="Booking">
                {detail.request.booking?.status || "Not created"}
              </Info>
            </div>

            <div className="admin-request-notes">
              <Info label="Itinerary changes">
                {detail.request.itineraryChanges}
              </Info>

              <Info label="Accommodation">
                {detail.request.accommodationPreferences}
              </Info>

              <Info label="Transport">
                {detail.request.transportationPreferences}
              </Info>

              <Info label="Activities">
                {detail.request.additionalActivities}
              </Info>

              <Info label="Customer note">
                {detail.request.customerMessage}
              </Info>
            </div>

            <form
              className="admin-form"
              onSubmit={saveQuote}
            >
              <h3>Quote proposal</h3>

              <div className="admin-form__grid">
                <FormField label="Price per person">
                  <Input
                    type="number"
                    min="0"
                    value={quote.quotedPricePerPerson}
                    onChange={(e) =>
                      setQuote({
                        ...quote,
                        quotedPricePerPerson:
                          e.target.value,
                      })
                    }
                  />
                </FormField>

                <FormField label="Quote expiry">
                  <Input
                    type="date"
                    value={quote.quoteExpiresAt}
                    onChange={(e) =>
                      setQuote({
                        ...quote,
                        quoteExpiresAt: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>

              <FormField label="Admin notes">
                <Textarea
                  value={quote.adminNotes}
                  onChange={(e) =>
                    setQuote({
                      ...quote,
                      adminNotes: e.target.value,
                    })
                  }
                />
              </FormField>

              <Button type="submit" loading={saving}>
                Save quote{" "}
                {quote.quotedPricePerPerson &&
                  `· ${money(
                    Number(quote.quotedPricePerPerson) *
                      detail.request.travelers
                  )}`}
              </Button>
            </form>

            <div className="admin-actions">
              <Select
                aria-label="Update request status"
                value=""
                onChange={(e) =>
                  e.target.value &&
                  setRequestStatus(e.target.value)
                }
                options={[
                  {
                    value: "",
                    label: "Update request status",
                  },
                  ...[
                    "pending",
                    "reviewing",
                    "rejected",
                    "expired",
                    "cancelled",
                  ].map((v) => ({
                    value: v,
                    label: v,
                  })),
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
