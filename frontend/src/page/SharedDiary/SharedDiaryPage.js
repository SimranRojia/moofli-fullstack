import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import CreateSharedDiaryForm from "../../component/sharedDiary/CreateSharedDiaryForm";
import SharedDiaryList from "../../component/sharedDiary/SharedDiaryList";
import { Sidebar } from "../../component/sideBar/sideBar";
import { MobileNavbar } from "../../component/Navbar/MobileNavbar";
import { RightSidebar } from "../../component/rightSideBar/RightSideBar";
import { BottomNav } from "../../component/Navbar/BottomNav";

export default function SharedDiaryPage() {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Please log in.
      </div>
    );

  const me = { id: user._id, username: user.username, email: user.email };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col lg:flex-row transition-all">
      {/* Sidebar (Desktop) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Navbar */}
      <div className="lg:hidden">
        <MobileNavbar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 px-4 sm:px-8 pt-28 pb-6 lg:pt-12 lg:pl-[260px] lg:pr-[340px] min-h-screen transition-all">
        {/* pt-28 ensures downward spacing on mobile (below navbar) */}

        {/* Create + List Section */}
        <div className="w-full max-w-2xl mx-auto lg:w-1/2 flex flex-col gap-6">
          {/* Create Shared Diary Card */}
          <div className="bg-white shadow-lg hover:shadow-xl border border-slate-200 rounded-2xl p-6 transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>Create Shared Diary</span>
              <span className="text-sm text-slate-500 font-normal">
                Invite & share with someone
              </span>
            </h2>
            <CreateSharedDiaryForm onCreated={() => {}} />
          </div>

          {/* Shared Diaries List */}
          <div className="bg-white shadow-md hover:shadow-lg border border-slate-200 rounded-2xl p-6 flex-1 overflow-hidden flex flex-col transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-slate-800">
                Your Shared Diaries
              </h3>
              <span className="text-sm text-slate-500">
                Tap to open or manage
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <SharedDiaryList
                onSelect={(d) => navigate(`/shareddiary/${d._id}`)}
                meId={me.id}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar (Desktop Only) */}
      <div className="hidden lg:block">
        <RightSidebar />
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav />
    </div>
  );
}
