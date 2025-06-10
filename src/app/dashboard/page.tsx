"use server";

import { auth } from "~/server/auth";
import { signout } from "../actions/auth";
import { db } from "~/server/db";
import UserMenu from "~/components/dashboard/UserMenu";
import CreateRoom from "~/components/dashboard/CreateRoom";
import RoomsView from "~/components/dashboard/RoomsView";

export default async function Page() {
  const session = await auth();

  const user = await db.user.findUniqueOrThrow({
    where: {
      id: session?.user.id,
    },
    include: {
      ownedRooms: true,
      roomInvites: {
        include: {
          room: true,
        },
      },
    },
  });

  return (
    <div className="flex h-screen w-full bg-sky-50">
      {/* Sidebar */}
      <div className="flex h-screen w-64 flex-col border-r border-sky-100 bg-white shadow-sm rounded-r-3xl overflow-hidden">
        <div className="p-4 bg-sky-100 rounded-br-3xl">
          <UserMenu email={user.email} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen w-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sky-100 bg-white px-8 shadow-sm rounded-bl-3xl">
          <h2 className="text-lg font-medium text-gray-800">Proyectos Recientes</h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 bg-sky-50">
          <div className="mb-8">
            <CreateRoom />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow border border-sky-100">
              <RoomsView
                ownedRooms={user.ownedRooms}
                roomInvites={user.roomInvites.map((x) => x.room)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}