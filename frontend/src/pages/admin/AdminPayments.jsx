import { useCallback, useEffect, useState } from "react";
import {
  DataTable,
  Modal,
  Select,
  StatusBadge,
  useToast,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminPayment,
  getAdminPayments,
} from "../../services/admin";
import {
  dateTime,
  money,
  PageHeading,
  Pagination,
  TableToolbar,
  Info,
} from "./AdminShared";

export default function AdminPayments() {
  const { token } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const r = await getAdminPayments(
          {
            page,
            search,
            status,
          },
          token
        );

        setItems(r.payments);
        setPagination(r.pagination);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    },
    [search, status, token, toast]
  );

  useEffect(() => {
    const id = setTimeout(() => {
      load();
    }, 250);

    return () => clearTimeout(id);
  }, [load]);

  async function open(r) {
    try {
      setDetail(
        await getAdminPayment(r._id, token)
      );
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <section className="admin-page">
      <PageHeading
        title="Payments"
        description="Read-only visibility into payment records. Verification remains secure."
      />

      <TableToolbar
        search={search}
        setSearch={setSearch}
        filters={
          <Select
            aria-label="Payment status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            options={[
              {
                value: "",
                label: "All statuses",
              },
              ...[
                "pending",
                "paid",
                "failed",
                "refunded",
              ].map((v) => ({
                value: v,
                label: v,
              })),
            ]}
          />
        }
      />

      <DataTable
        loading={loading}
        data={items}
        keyField="_id"
        onRowClick={open}
        columns={[
          {
            key: "booking",
            title: "Booking",
            render: (r) => (
              <strong>
                {r.booking?.bookingReference || "—"}
              </strong>
            ),
          },
          {
            key: "user",
            title: "Customer",
            render: (r) => r.user?.name || "—",
          },
          {
            key: "amount",
            title: "Amount",
            render: (r) => money(r.amount),
          },
          {
            key: "provider",
            title: "Provider",
            render: (r) => r.provider || "—",
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

      <Pagination
        pagination={pagination}
        onChange={load}
      />

      <Modal
        isOpen={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Payment details"
      >
        {detail?.payment && (
          <div className="admin-detail-grid">
            <Info label="Booking">
              {detail.payment.booking?.bookingReference ||
                "—"}
            </Info>

            <Info label="Customer">
              {detail.payment.user?.name || "—"} ·{" "}
              {detail.payment.user?.email || "—"}
            </Info>

            <Info label="Amount">
              {money(detail.payment.amount)}{" "}
              {detail.payment.currency}
            </Info>

            <Info label="Status">
              <StatusBadge
                status={detail.payment.status}
              />
            </Info>

            <Info label="Provider">
              {detail.payment.provider || "—"}
            </Info>

            <Info label="Order ID">
              {detail.payment.providerOrderId || "—"}
            </Info>

            <Info label="Payment ID">
              {detail.payment.providerPaymentId || "—"}
            </Info>

            <Info label="Created">
              {dateTime(detail.payment.createdAt)}
            </Info>

            <Info label="Paid">
              {dateTime(detail.payment.paidAt)}
            </Info>
          </div>
        )}
      </Modal>
    </section>
  );
}
