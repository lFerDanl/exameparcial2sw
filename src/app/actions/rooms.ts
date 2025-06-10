"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { GoogleGenAI, createUserContent } from "@google/genai";

export async function createRoom() {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  const room = await db.room.create({
    data: {
      owner: {
        connect: {
          id: session.user.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  redirect("/dashboard/" + room.id);
}

export async function updateRoomTitle(title: string, id: string) {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  await db.room.findUniqueOrThrow({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  await db.room.update({
    where: {
      id: id,
    },
    data: {
      title: title,
    },
  });

  revalidatePath("dashboard");
}

export async function deleteRoom(id: string) {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  await db.room.findUniqueOrThrow({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  await db.room.delete({
    where: {
      id: id,
    },
  });

  revalidatePath("dashboard");
}

export async function shareRoom(id: string, inviteEmail: string) {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  await db.room.findUniqueOrThrow({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  const invitedUser = await db.user.findUnique({
    where: { email: inviteEmail },
    select: { id: true },
  });

  if (!invitedUser) return "User not found.";

  await db.roomInvite.create({
    data: {
      roomId: id,
      userId: invitedUser.id,
    },
  });

  revalidatePath("dashboard");
}

export async function deleteInvitation(id: string, inviteEmail: string) {
  const session = await auth();

  if (!session?.user.id) throw new Error("No user id found.");

  await db.room.findUniqueOrThrow({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  await db.roomInvite.deleteMany({
    where: {
      roomId: id,
      user: {
        email: inviteEmail,
      },
    },
  });

  revalidatePath("dashboard");
}

 export async function createRoomWithPrompt(prompt: string): Promise<string> {
  const session = await auth();
  if (!session?.user.id) throw new Error("No user id found.");

  // Inicializar Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
  });

  const fullPrompt = `
Eres una IA que genera diseños de interfaces para una herramienta tipo Figma.
Genera un diseño en formato JSON que represente esta descripción del usuario:

"${prompt}"

Sigue esta estructura:
{
  "layers": {
    "[ID]": {
      "type": [0=Rectangle, 1=Ellipse, 3=Text],
      "x": [number],
      "y": [number],
      "height": [number],
      "width": [number],
      "fill": {"r":0-255, "g":0-255, "b":0-255},
      "stroke": {"r":0-255, "g":0-255, "b":0-255},
      "opacity": 0-100,
      "fontSize": number,
      "text": string,
      "fontWeight": number,
      "fontFamily": string
    }
  },
  "layerIds": [IDs],
  "roomColor": {"r":30,"g":30,"b":30}
}
Solo responde con el JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [createUserContent(fullPrompt)],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  const match = text?.match(/```json\n([\s\S]*?)\n```/) || text?.match(/{[\s\S]*}/);
  const json = JSON.parse(match?.[1] || match?.[0] || "{}");

  // Crear la sala
  const room = await db.room.create({
    data: {
      owner: { connect: { id: session.user.id } },
      data: json, // Asume que el campo "data" en la tabla `room` es tipo JSON
    },
    select: { id: true },
  });

  return room.id;
}