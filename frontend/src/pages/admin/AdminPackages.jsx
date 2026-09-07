import { useCallback, useEffect, useState } from "react";
import {
  Button,
  DataTable,
  FormField,
  Input,
  Modal,
  Select,
  Textarea,
  StatusBadge,
  useToast,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import {
  createAdminPackage,
  getAdminDestinations,
  getAdminPackages,
  updateAdminPackage,
  deleteAdminPackage,
} from "../../services/admin";
import {
  money,
  PageHeading,
  Pagination,
  TableToolbar,
} from "./AdminShared";

const blank = {
  destination: "",
  title: "",
  description: "",
  imageUrl: "",
  days: "",
  nights: "",
  pricePerPerson: "",
  hasLimit: true,
  maxGroupSize: "",
  status: "draft",
  accommodationName: "",
  accommodationDescription: "",
  breakfast: false,
  lunch: false,
  dinner: false,
  transportationDescription: "",
  activitiesDescription: "",
  itinerary: [],
  inclusions: "",
  exclusions: "",
};

const lines = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const createItineraryDay = (day = 1) => ({
  day,
  title: "",
  description: "",
  places: [],
  activities: [],
});

const normalizeItinerary = (items) =>
  (items || []).map((item, index) => ({
    day: index + 1,
    title: item?.title || "",
    description: item?.description || "",
    places: Array.isArray(item?.places)
      ? item.places
          .filter(Boolean)
          .map((place) => String(place))
      : [],
    activities: Array.isArray(item?.activities)
      ? item.activities
          .filter(Boolean)
          .map((activity) => String(activity))
      : [],
  }));

function ItineraryList({
  label,
  singularLabel,
  items,
  onAdd,
  onChange,
  onRemove,
}) {
  return (
    <div className="admin-itinerary__list">
      <div className="admin-itinerary__list-header">
        <div>
          <span className="admin-itinerary__list-title">
            {label}
          </span>

          <span className="admin-itinerary__list-count">
            {items.length}
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={onAdd}
        >
          Add {singularLabel}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="admin-itinerary__list-empty">
          No {label.toLowerCase()} added yet.
        </div>
      ) : (
        <div className="admin-itinerary__list-items">
          {items.map((item, itemIndex) => (
            <div
              className="admin-itinerary__list-item"
              key={`${label}-${itemIndex}`}
            >
              <Input
                value={item}
                placeholder={`${singularLabel} name`}
                onChange={(event) =>
                  onChange(
                    itemIndex,
                    event.target.value,
                  )
                }
              />

              <Button
                type="button"
                variant="danger"
                onClick={() => onRemove(itemIndex)}
                aria-label={`Remove ${singularLabel}`}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPackages() {
  const { token } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [pagination, setPagination] = useState();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const [
          packagesResponse,
          destinationsResponse,
        ] = await Promise.all([
          getAdminPackages(
            { page, search, status },
            token,
          ),
          getAdminDestinations(
            { limit: 100 },
            token,
          ),
        ]);

        setItems(packagesResponse.packages);
        setPagination(
          packagesResponse.pagination,
        );
        setDestinations(
          destinationsResponse.destinations,
        );
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [search, status, token, toast],
  );

  useEffect(() => {
    const id = setTimeout(
      () => load(),
      250,
    );

    return () => clearTimeout(id);
  }, [load]);

  const open = (packageItem) => {
    if (!packageItem) {
      setForm({
        ...blank,
        itinerary: [],
      });

      setModal("new");
      return;
    }

    setForm({
      destination:
        packageItem.destination?._id ||
        packageItem.destination ||
        "",

      title: packageItem.title || "",
      description:
        packageItem.description || "",
      imageUrl:
        packageItem.imageUrl || "",

      days:
        packageItem.duration?.days ?? "",
      nights:
        packageItem.duration?.nights ?? "",

      pricePerPerson:
        packageItem.pricePerPerson ?? "",

      hasLimit:
        packageItem.groupLimit?.hasLimit ??
        true,

      maxGroupSize:
        packageItem.groupLimit?.maxGroupSize ??
        "",

      status:
        packageItem.status || "draft",

      accommodationName:
        packageItem.accommodation?.name ||
        "",

      accommodationDescription:
        packageItem.accommodation
          ?.description || "",

      breakfast:
        packageItem.meals?.breakfast ||
        false,

      lunch:
        packageItem.meals?.lunch || false,

      dinner:
        packageItem.meals?.dinner ||
        false,

      transportationDescription:
        packageItem.transportation
          ?.description || "",

      activitiesDescription:
        packageItem.activities
          ?.description || "",

      itinerary: normalizeItinerary(
        packageItem.itinerary,
      ),

      inclusions:
        (
          packageItem.inclusions || []
        ).join("\n"),

      exclusions:
        (
          packageItem.exclusions || []
        ).join("\n"),
    });

    setModal(packageItem);
  };

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const change = (event) => {
    const {
      name,
      type,
      value,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const updateItineraryDay = (
    index,
    field,
    value,
  ) => {
    setForm((current) => ({
      ...current,

      itinerary: current.itinerary.map(
        (day, dayIndex) =>
          dayIndex === index
            ? {
                ...day,
                [field]: value,
              }
            : day,
      ),
    }));
  };

  const addItineraryDay = () => {
    setForm((current) => ({
      ...current,

      itinerary: [
        ...current.itinerary,

        createItineraryDay(
          current.itinerary.length + 1,
        ),
      ],
    }));
  };

  const removeItineraryDay = (
    index,
  ) => {
    setForm((current) => ({
      ...current,

      itinerary: current.itinerary
        .filter(
          (_, dayIndex) =>
            dayIndex !== index,
        )
        .map((day, dayIndex) => ({
          ...day,
          day: dayIndex + 1,
        })),
    }));
  };

  const addItineraryListItem = (
    dayIndex,
    field,
  ) => {
    setForm((current) => ({
      ...current,

      itinerary: current.itinerary.map(
        (day, index) =>
          index === dayIndex
            ? {
                ...day,

                [field]: [
                  ...day[field],
                  "",
                ],
              }
            : day,
      ),
    }));
  };

  const updateItineraryListItem = (
    dayIndex,
    field,
    itemIndex,
    value,
  ) => {
    setForm((current) => ({
      ...current,

      itinerary: current.itinerary.map(
        (day, index) =>
          index === dayIndex
            ? {
                ...day,

                [field]: day[field].map(
                  (
                    item,
                    indexInList,
                  ) =>
                    indexInList ===
                    itemIndex
                      ? value
                      : item,
                ),
              }
            : day,
      ),
    }));
  };

  const removeItineraryListItem = (
    dayIndex,
    field,
    itemIndex,
  ) => {
    setForm((current) => ({
      ...current,

      itinerary: current.itinerary.map(
        (day, index) =>
          index === dayIndex
            ? {
                ...day,

                [field]: day[field].filter(
                  (
                    _,
                    indexInList,
                  ) =>
                    indexInList !==
                    itemIndex,
                ),
              }
            : day,
      ),
    }));
  };

  const buildItineraryPayload = () =>
    form.itinerary.map((day, index) => ({
      day: index + 1,

      title: String(
        day.title || "",
      ).trim(),

      description: String(
        day.description || "",
      ).trim(),

      places: day.places
        .map((place) =>
          String(place || "").trim(),
        )
        .filter(Boolean),

      activities: day.activities
        .map((activity) =>
          String(activity || "").trim(),
        )
        .filter(Boolean),
    }));

  async function save(event) {
    event.preventDefault();

    if (
      !form.destination ||
      !form.title.trim() ||
      !form.description.trim() ||
      !form.imageUrl.trim() ||
      !form.days ||
      !form.pricePerPerson
    ) {
      toast.error(
        "Complete all required journey details.",
      );
      return;
    }

    const itineraryPayload =
      buildItineraryPayload();

    const invalidItineraryDay =
      itineraryPayload.find(
        (day) =>
          !day.title ||
          !day.description,
      );

    if (invalidItineraryDay) {
      toast.error(
        `Complete the title and description for Day ${invalidItineraryDay.day}.`,
      );
      return;
    }

    if (
      form.hasLimit &&
      (
        !form.maxGroupSize ||
        Number(form.maxGroupSize) < 1
      )
    ) {
      toast.error(
        "Enter a valid maximum group size.",
      );
      return;
    }

    const body = {
      destination: form.destination,

      title: form.title.trim(),

      description:
        form.description.trim(),

      imageUrl:
        form.imageUrl.trim(),

      duration: {
        days: Number(form.days),
        nights:
          Number(form.nights) || 0,
      },

      pricePerPerson:
        Number(form.pricePerPerson),

      groupLimit: {
        hasLimit: form.hasLimit,

        maxGroupSize:
          form.hasLimit
            ? Number(form.maxGroupSize)
            : null,
      },

      status: form.status,

      accommodation: {
        included: true,

        name:
          form.accommodationName.trim(),

        description:
          form.accommodationDescription.trim(),
      },

      meals: {
        breakfast: form.breakfast,
        lunch: form.lunch,
        dinner: form.dinner,
      },

      transportation: {
        included: true,

        description:
          form.transportationDescription.trim(),
      },

      activities: {
        included: true,

        description:
          form.activitiesDescription.trim(),
      },

      itinerary:
        itineraryPayload,

      inclusions:
        lines(form.inclusions),

      exclusions:
        lines(form.exclusions),
    };

    try {
      setSaving(true);

      if (modal?._id) {
        await updateAdminPackage(
          modal._id,
          body,
          token,
        );
      } else {
        await createAdminPackage(
          body,
          token,
        );
      }

      toast.success("Package saved.");

      setModal(null);

      load(pagination?.page);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      setSaving(true);

      await deleteAdminPackage(
        deleteTarget._id,
        token,
      );

      toast.success(
        "Package deleted.",
      );

      setDeleteTarget(null);

      load(pagination?.page);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeading
        title="Tour packages"
        description="Build the journeys that form every DeepTravel proposal."
        action={
          <Button
            onClick={() => open(null)}
          >
            New package
          </Button>
        }
      />

      <TableToolbar
        search={search}
        setSearch={setSearch}
        filters={
          <Select
            aria-label="Package status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            options={[
              {
                value: "",
                label: "All statuses",
              },
              {
                value: "draft",
                label: "Draft",
              },
              {
                value: "active",
                label: "Active",
              },
              {
                value: "inactive",
                label: "Inactive",
              },
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
            key: "title",
            title: "Package",
            render: (row) => (
              <strong>
                {row.title}
              </strong>
            ),
          },

          {
            key: "destination",
            title: "Destination",
            render: (row) =>
              row.destination?.name ||
              "—",
          },

          {
            key: "price",
            title: "Price",
            render: (row) =>
              money(
                row.pricePerPerson,
              ),
          },

          {
            key: "status",
            title: "Status",
            render: (row) => (
              <StatusBadge
                status={row.status}
              />
            ),
          },
        ]}
      />

      <Pagination
        pagination={pagination}
        onChange={load}
      />

      <Modal
        isOpen={Boolean(modal)}
        onClose={closeModal}
        title={
          modal?._id
            ? "Edit package"
            : "New package"
        }
        size="xl"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeModal}
            >
              Cancel
            </Button>

            <Button
              form="package-form"
              type="submit"
              loading={saving}
            >
              Save package
            </Button>
          </>
        }
      >
        <form
          id="package-form"
          className="admin-form"
          onSubmit={save}
        >
          <div className="admin-form__grid">
            <FormField
              label="Destination"
              required
            >
              <Select
                name="destination"
                value={
                  form.destination
                }
                onChange={change}
                placeholder="Choose destination"
                options={destinations.map(
                  (destination) => ({
                    value:
                      destination._id,

                    label: `${destination.name}, ${destination.country}`,
                  }),
                )}
              />
            </FormField>

            <FormField label="Status">
              <Select
                name="status"
                value={form.status}
                onChange={change}
                options={[
                  "draft",
                  "active",
                  "inactive",
                ].map(
                  (value) => ({
                    value,
                    label: value,
                  }),
                )}
              />
            </FormField>
          </div>

          <FormField
            label="Title"
            required
          >
            <Input
              name="title"
              value={form.title}
              onChange={change}
            />
          </FormField>

          <FormField
            label="Description"
            required
          >
            <Textarea
              name="description"
              value={
                form.description
              }
              onChange={change}
            />
          </FormField>

          <FormField
            label="Image URL"
            required
          >
            <Input
              name="imageUrl"
              value={form.imageUrl}
              onChange={change}
            />
          </FormField>

          <div className="admin-form__grid">
            <FormField
              label="Days"
              required
            >
              <Input
                name="days"
                type="number"
                min="1"
                value={form.days}
                onChange={change}
              />
            </FormField>

            <FormField label="Nights">
              <Input
                name="nights"
                type="number"
                min="0"
                value={form.nights}
                onChange={change}
              />
            </FormField>

            <FormField
              label="Price per person"
              required
            >
              <Input
                name="pricePerPerson"
                type="number"
                min="0"
                value={
                  form.pricePerPerson
                }
                onChange={change}
              />
            </FormField>

            <FormField label="Maximum group size">
              <Input
                name="maxGroupSize"
                type="number"
                min="1"
                disabled={!form.hasLimit}
                value={
                  form.maxGroupSize
                }
                onChange={change}
              />
            </FormField>
          </div>

          <label className="admin-check">
            <input
              name="hasLimit"
              type="checkbox"
              checked={
                form.hasLimit
              }
              onChange={change}
            />
            Limit group size
          </label>

          <FormField label="Accommodation">
            <Input
              name="accommodationName"
              value={
                form.accommodationName
              }
              onChange={change}
              placeholder="Accommodation name"
            />
          </FormField>

          <FormField label="Accommodation details">
            <Textarea
              name="accommodationDescription"
              value={
                form.accommodationDescription
              }
              onChange={change}
            />
          </FormField>

          <div className="admin-check-row">
            {[
              "breakfast",
              "lunch",
              "dinner",
            ].map((name) => (
              <label
                className="admin-check"
                key={name}
              >
                <input
                  name={name}
                  type="checkbox"
                  checked={form[name]}
                  onChange={change}
                />

                {name}
              </label>
            ))}
          </div>

          <FormField label="Transportation">
            <Textarea
              name="transportationDescription"
              value={
                form.transportationDescription
              }
              onChange={change}
            />
          </FormField>

          <FormField label="Activities">
            <Textarea
              name="activitiesDescription"
              value={
                form.activitiesDescription
              }
              onChange={change}
            />
          </FormField>

          <div className="admin-itinerary">
            <div className="admin-itinerary__toolbar">
              <div>
                <h3 className="admin-itinerary__title">
                  Itinerary
                </h3>

                <p className="admin-itinerary__helper">
                  Build each journey day
                  with its places and
                  activities.
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={
                  addItineraryDay
                }
              >
                Add day
              </Button>
            </div>

            {form.itinerary.length ===
            0 ? (
              <div className="admin-itinerary__empty">
                <strong>
                  No itinerary days
                  yet.
                </strong>

                <span>
                  Add a day to start
                  building the package
                  itinerary.
                </span>

                <Button
                  type="button"
                  onClick={
                    addItineraryDay
                  }
                >
                  Add first day
                </Button>
              </div>
            ) : (
              <div className="admin-itinerary__days">
                {form.itinerary.map(
                  (
                    day,
                    dayIndex,
                  ) => (
                    <article
                      className="admin-itinerary__day"
                      key={`itinerary-day-${dayIndex}`}
                    >
                      <div className="admin-itinerary__day-header">
                        <div className="admin-itinerary__day-label">
                          <span>
                            DAY
                          </span>

                          <strong>
                            {dayIndex +
                              1}
                          </strong>
                        </div>

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() =>
                            removeItineraryDay(
                              dayIndex,
                            )
                          }
                        >
                          Remove day
                        </Button>
                      </div>

                      <div className="admin-form__grid">
                        <FormField
                          label="Day title"
                          required
                        >
                          <Input
                            value={
                              day.title
                            }
                            placeholder="Arrival & city exploration"
                            onChange={(
                              event,
                            ) =>
                              updateItineraryDay(
                                dayIndex,
                                "title",
                                event.target
                                  .value,
                              )
                            }
                          />
                        </FormField>

                        <div className="admin-itinerary__day-number">
                          <span>
                            Journey day
                          </span>

                          <strong>
                            Day{" "}
                            {dayIndex +
                              1}
                          </strong>
                        </div>
                      </div>

                      <FormField
                        label="Day description"
                        required
                      >
                        <Textarea
                          value={
                            day.description
                          }
                          placeholder="Describe what happens during this day..."
                          onChange={(
                            event,
                          ) =>
                            updateItineraryDay(
                              dayIndex,
                              "description",
                              event.target
                                .value,
                            )
                          }
                        />
                      </FormField>

                      <div className="admin-itinerary__lists">
                        <ItineraryList
                          label="Places"
                          singularLabel="place"
                          items={
                            day.places
                          }
                          onAdd={() =>
                            addItineraryListItem(
                              dayIndex,
                              "places",
                            )
                          }
                          onChange={(
                            itemIndex,
                            value,
                          ) =>
                            updateItineraryListItem(
                              dayIndex,
                              "places",
                              itemIndex,
                              value,
                            )
                          }
                          onRemove={(
                            itemIndex,
                          ) =>
                            removeItineraryListItem(
                              dayIndex,
                              "places",
                              itemIndex,
                            )
                          }
                        />

                        <ItineraryList
                          label="Activities"
                          singularLabel="activity"
                          items={
                            day.activities
                          }
                          onAdd={() =>
                            addItineraryListItem(
                              dayIndex,
                              "activities",
                            )
                          }
                          onChange={(
                            itemIndex,
                            value,
                          ) =>
                            updateItineraryListItem(
                              dayIndex,
                              "activities",
                              itemIndex,
                              value,
                            )
                          }
                          onRemove={(
                            itemIndex,
                          ) =>
                            removeItineraryListItem(
                              dayIndex,
                              "activities",
                              itemIndex,
                            )
                          }
                        />
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="admin-form__grid">
            <FormField
              label="Inclusions"
              helperText="One item per line"
            >
              <Textarea
                name="inclusions"
                value={
                  form.inclusions
                }
                onChange={change}
              />
            </FormField>

            <FormField
              label="Exclusions"
              helperText="One item per line"
            >
              <Textarea
                name="exclusions"
                value={
                  form.exclusions
                }
                onChange={change}
              />
            </FormField>
          </div>

          {modal?._id && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setDeleteTarget(
                  modal,
                );
                setModal(null);
              }}
            >
              Delete package
            </Button>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() =>
          setDeleteTarget(null)
        }
        title="Delete package"
        description="Referenced packages must be made inactive instead."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                setDeleteTarget(null)
              }
            >
              Keep package
            </Button>

            <Button
              variant="danger"
              loading={saving}
              onClick={remove}
            >
              Delete
            </Button>
          </>
        }
      />
    </section>
  );
}
