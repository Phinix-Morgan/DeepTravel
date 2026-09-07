import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import DestinationDetails from "./pages/DestinationDetails";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./pages/EmailVerification";
import ResendVerification from "./pages/ResendVerification";
import OAuthCallback from "./pages/OAuthCallback";
import Trips from "./pages/Trips";
import TripDetails from "./pages/TripDetails";
import PackageDetails from "./pages/PackageDetails";
import CustomTripBuilder from "./pages/CustomTripBuilder";
import CustomTripDetails from "./pages/CustomTripDetails";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCustomTrips from "./pages/admin/AdminCustomTrips";
import AdminDestinations from "./pages/admin/AdminDestinations";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminDepartures from "./pages/admin/AdminDepartures";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminUsers from "./pages/admin/AdminUsers";




import ProtectedRoute from "./components/ProtectedRoute";

function Placeholder({ title }) {
  return (
    <section className="section">
      <div className="content-width">
        <p className="eyebrow">
          DeepTravel
        </p>

        <h1 className="display-md">
          {title}
        </h1>

        <p className="text-muted">
          This page is coming next.
        </p>
      </div>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            MAIN LAYOUT
            ================================================== */}

        <Route element={<MainLayout />}>

          {/* ==================================================
              PUBLIC
              ================================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/explore"
            element={<Explore />}
          />

          <Route
            path="/explore/:id"
            element={<DestinationDetails />}
          />

          <Route
            path="/packages/:id"
            element={<PackageDetails />}
          />


          {/* ==================================================
              AUTHENTICATION
              ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          <Route
            path="/verify-email/:token"
            element={<EmailVerification />}
          />

          <Route
            path="/resend-verification"
            element={<ResendVerification />}
          />

          <Route
            path="/oauth/callback"
            element={<OAuthCallback />}
          />


          {/* ==================================================
              OTHER PUBLIC PAGES
              ================================================== */}

          <Route
            path="/about"
            element={
              <Placeholder
                title="About DeepTravel"
              />
            }
          />

          <Route
            path="/contact"
            element={
              <Placeholder
                title="Contact us"
              />
            }
          />

          <Route
            path="/support"
            element={
              <Placeholder
                title="Support"
              />
            }
          />


          {/* ==================================================
              PROTECTED ROUTES
              ================================================== */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/trips"
              element={<Trips />}
            />

            <Route
              path="/trips/:id"
              element={<TripDetails />}
            />

            <Route
              path="/custom-trip"
              element={<CustomTripBuilder />}
            />

            <Route
              path="/custom-trips/:id"
              element={<CustomTripDetails />}
            />

          </Route>

        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/custom-trips" element={<AdminCustomTrips />} />
            <Route path="/admin/destinations" element={<AdminDestinations />} />
            <Route path="/admin/packages" element={<AdminPackages />} />
            <Route path="/admin/departures" element={<AdminDepartures />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
