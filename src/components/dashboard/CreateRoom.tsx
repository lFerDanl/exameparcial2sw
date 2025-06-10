"use client";

import { useState } from "react";
import { SlPencil } from "react-icons/sl";
import { RiRobot2Line } from "react-icons/ri";
import { createRoom } from "~/app/actions/rooms";
import { createRoomWithPrompt } from "~/app/actions/rooms";
import { useRouter } from "next/navigation";

export default function CreateRoom() {
  const [hover, setHover] = useState(false);
  const router = useRouter();

const handleCreateWithPrompt = async () => {
  const userPrompt = window.prompt("Describe tu diseño (ej. pantalla de registro tipo Facebook):");
  if (!userPrompt) return;

  const roomId = await createRoomWithPrompt(userPrompt);
  router.push(`/dashboard/${roomId}?initialPrompt=${encodeURIComponent(userPrompt)}`);
};
  return (
    <div className="flex gap-4">
      {/* Botón clásico */}
      <div
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => createRoom()}
        className="flex h-fit w-fit cursor-pointer select-none items-center gap-4 rounded-3xl bg-sky-50 px-8 py-6 transition-all hover:bg-blue-500 hover:shadow-lg border border-sky-100"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 p-3 transition-colors group-hover:bg-white">
          <SlPencil className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col gap-1 text-[13px]">
          <p className={`font-semibold ${hover ? "text-white" : "text-gray-800"}`}>
            Nuevo diseño
          </p>
          <p className={`${hover ? "text-white" : "text-gray-600"}`}>
            Crea un nuevo diseño
          </p>
        </div>
      </div>

      {/* Botón con IA */}
      <div
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleCreateWithPrompt}
        className="flex h-fit w-fit cursor-pointer select-none items-center gap-4 rounded-3xl bg-sky-50 px-8 py-6 transition-all hover:bg-blue-500 hover:shadow-lg border border-sky-100"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 p-3 transition-colors group-hover:bg-white">
          <RiRobot2Line className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col gap-1 text-[13px]">
          <p className={`font-semibold ${hover ? "text-white" : "text-gray-800"}`}>
            Crear con IA
          </p>
          <p className={`${hover ? "text-white" : "text-gray-600"}`}>
            Diseño asistido por IA
          </p>
        </div>
      </div>
    </div>
  );
}