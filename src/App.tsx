import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./layout";
import PrivateRoute from "./routes/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import RegisterDevice from "./pages/RegisterDevice";
import Login from "./pages/Login";
import Loading from "./Laoding";
import PlaceholderEditor from "./pages/Placeholder";
import NotFoundPage from "./pages/Forbidden_403";
import NotFound from "./pages/Notfound_404";
import Account from "./pages/Account";
import ApkVersionsPage from "./pages/ApkVersions";
import Plans from "./pages/Plans";
import AdminPlans from "./pages/Plans/admimIndex";

import StreamProvidersPage from "./pages/StreamProviders";
import ProviderChannelsPage from "./pages/StreamProviders/components/providerChannelsPage";
import ChannelDetailPage from "./pages/StreamProviders/components/channelDetailsPage";

import ExportDetails from "./pages/ExportDetails";
import ScreenLayoutPage from "./pages/AddToSchedule/screen-layout/page";
import ScheduleAddPageDetails from "./pages/AddToSchedule/layoutdetails/page";

// Lazy load components
const Devices = lazy(() => import("./pages/Devices"));
const DeviceGroup = lazy(() => import("./pages/DeviceGroups"));
const Ads = lazy(() => import("./pages/Ads"));
const Calendar = lazy(() => import("./pages/Schedule/schedule"));
const Clients = lazy(() => import("./pages/clients"));
const AddToSchedule = lazy(() => import("./pages/AddToSchedule"));
const AdPage = lazy(() => import("./pages/AdPage"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const NewCampaignPage = lazy(() => import("./pages/Campaigns/new"));
const EditCampaignPage = lazy(() => import("./pages/Campaigns/edit"));
const CampaignInteractions = lazy(() => import("./pages/CampaignInteractions"));
const Users = lazy(() => import("./pages/Users"));
const DevicePage = lazy(() => import("./pages/DevicePage"));
const Carousels = lazy(() => import("./pages/Carousels"));
const CreateCarousel = lazy(() => import("./pages/Carousels/create"));
const LiveContent = lazy(() => import("./pages/LiveContent"));
const CreateLiveContent = lazy(() => import("./pages/LiveContent/create"));

// Loading Fallback Component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-device" element={<RegisterDevice />} />

        <Route element={<Layout />}>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/plans/all"
              element={
                <Suspense fallback={<Loading />}>
                  <Plans />
                </Suspense>
              }
            />

            <Route
              path="/screen-layout"
              element={
                <Suspense fallback={<Loading />}>
                  <ScreenLayoutPage />
                </Suspense>
              }
            />

            <Route
              path="/layout-details/:layout_id"
              element={
                <Suspense fallback={<Loading />}>
                  <ScheduleAddPageDetails />
                </Suspense>
              }
            />

            <Route
              path="/all-plans"
              element={
                <Suspense fallback={<Loading />}>
                  <AdminPlans />
                </Suspense>
              }
            />

            <Route
              path="/all-exports"
              element={
                <Suspense fallback={<Loading />}>
                  <ExportDetails />
                </Suspense>
              }
            />

            <Route
              path="/account"
              element={
                <Suspense fallback={<Loading />}>
                  <Account />
                </Suspense>
              }
            />

            {/* Wrap each lazy-loaded route inside Suspense */}
            <Route
              path="/ads"
              element={
                <Suspense fallback={<Loading />}>
                  <Ads />
                </Suspense>
              }
            />
            <Route
              path="/user/all"
              element={
                <Suspense fallback={<Loading />}>
                  <Users />
                </Suspense>
              }
            />

            <Route
              path="/ads/:ad_id"
              element={
                <Suspense fallback={<Loading />}>
                  <AdPage edit={false} />
                </Suspense>
              }
            />
            <Route
              path="/ads/:ad_id/edit"
              element={
                <Suspense fallback={<Loading />}>
                  <AdPage edit={true} />
                </Suspense>
              }
            />
            <Route
              path="/ads/clients"
              element={
                <Suspense fallback={<Loading />}>
                  <Clients />
                </Suspense>
              }
            />
            <Route
              path="/schedule"
              element={
                <Suspense fallback={<Loading />}>
                  <Schedule />
                </Suspense>
              }
            />
            <Route
              path="/schedule/calendar"
              element={
                <Suspense fallback={<Loading />}>
                  <Calendar />
                </Suspense>
              }
            />
            <Route
              path="/schedule/placeholder"
              element={
                <Suspense fallback={<Loading />}>
                  <PlaceholderEditor />
                </Suspense>
              }
            />
            <Route
              path="/schedule/add"
              element={
                <Suspense fallback={<Loading />}>
                  <AddToSchedule />
                </Suspense>
              }
            />
            <Route
              path="/devices"
              element={
                <Suspense fallback={<Loading />}>
                  <Devices />
                </Suspense>
              }
            />
            <Route
              path="/devices/:device_id"
              element={
                <Suspense fallback={<Loading />}>
                  <DevicePage />
                </Suspense>
              }
            />
            <Route
              path="/devices/groups"
              element={
                <Suspense fallback={<Loading />}>
                  <DeviceGroup />
                </Suspense>
              }
            />
            {/* <Route
              path="/devices/cricket"
              element={
                <Suspense fallback={<Loading />}>
                  <CricketPage />
                </Suspense>
              }
            /> */}

            <Route
              path="/apkVersion"
              element={
                <Suspense fallback={<Loading />}>
                  <ApkVersionsPage />
                </Suspense>
              }
            />
            <Route
              path="/campaigns"
              element={
                <Suspense fallback={<Loading />}>
                  <Campaigns />
                </Suspense>
              }
            />
            <Route
              path="/campaigns/new"
              element={
                <Suspense fallback={<Loading />}>
                  <NewCampaignPage />
                </Suspense>
              }
            />
            <Route
              path="/campaigns/edit/:campaign_id"
              element={
                <Suspense fallback={<Loading />}>
                  <EditCampaignPage />
                </Suspense>
              }
            />
            <Route
              path="/campaigns/interactions"
              element={
                <Suspense fallback={<Loading />}>
                  <CampaignInteractions />
                </Suspense>
              }
            />

            {/* Carousel Routes */}
            <Route
              path="/carousels"
              element={
                <Suspense fallback={<Loading />}>
                  <Carousels />
                </Suspense>
              }
            />
            <Route
              path="/carousels/add"
              element={
                <Suspense fallback={<Loading />}>
                  <CreateCarousel />
                </Suspense>
              }
            />
            <Route
              path="/carousels/:id"
              element={
                <Suspense fallback={<Loading />}>
                  <CreateCarousel />
                </Suspense>
              }
            />

            {/* Live Content Routes */}
            <Route
              path="/live-content"
              element={
                <Suspense fallback={<Loading />}>
                  <LiveContent />
                </Suspense>
              }
            />
            <Route
              path="/live-content/add"
              element={
                <Suspense fallback={<Loading />}>
                  <CreateLiveContent />
                </Suspense>
              }
            />
            <Route
              path="/live-content/:id"
              element={
                <Suspense fallback={<Loading />}>
                  <CreateLiveContent />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/forbidden"
            element={
              <Suspense fallback={<Loading />}>
                <NotFoundPage />
              </Suspense>
            }
          />

          <Route
            path="/stream-providers"
            element={
              <Suspense fallback={<Loading />}>
                <StreamProvidersPage />
              </Suspense>
            }
          />
          <Route
            path="/stream-providers/:slug"
            element={
              <Suspense fallback={<Loading />}>
                <ProviderChannelsPage />
              </Suspense>
            }
          />

          <Route
            path="/stream-providers/:slug/:channelId"
            element={
              <Suspense fallback={<Loading />}>
                <ChannelDetailPage />
              </Suspense>
            }
          />

          <Route
            path="*"
            element={
              <Suspense fallback={<Loading />}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
